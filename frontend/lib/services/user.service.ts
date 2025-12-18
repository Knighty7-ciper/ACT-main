/**
 * User Service - Complete User Management & KYC System
 * 
 * Handles user profiles, authentication state, KYC verification,
 * and integration with wallet and payment systems.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// User Profile Interface
export interface UserProfile {
  id: string;
  user_id: string; // References auth.users
  email: string;
  phone?: string;
  full_name?: string;
  date_of_birth?: string;
  national_id?: string;
  passport_number?: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  kyc_level: 'basic' | 'intermediate' | 'full';
  country_code: string;
  currency_preference: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  verification_documents: {
    id_front?: string; // Supabase storage URL
    id_back?: string;
    selfie?: string;
    address_proof?: string;
  };
  limits: {
    daily_limit: number;
    monthly_limit: number;
    annual_limit: number;
    current_daily_spent: number;
    current_monthly_spent: number;
    current_annual_spent: number;
  };
}

// KYC Document Interface
export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: 'national_id' | 'passport' | 'drivers_license' | 'address_proof';
  document_number?: string;
  front_image_url?: string;
  back_image_url?: string;
  selfie_url?: string;
  status: 'uploaded' | 'reviewing' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

// User Limits Interface
export interface UserLimits {
  daily_limit: number;
  monthly_limit: number;
  annual_limit: number;
  current_daily_spent: number;
  current_monthly_spent: number;
  current_annual_spent: number;
}

class UserService {
  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
  }

  /**
   * Get user profile with complete data
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        return await this.createUserProfile(userId);
      }
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  /**
   * Create new user profile
   */
  async createUserProfile(userId: string, initialData?: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    const newProfile: Partial<UserProfile> = {
      user_id: userId,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || '',
      kyc_status: 'pending',
      kyc_level: 'basic',
      country_code: 'KE', // Default to Kenya
      currency_preference: 'KES',
      is_active: true,
      verification_documents: {},
      limits: {
        daily_limit: 10000, // $10,000 USD equivalent
        monthly_limit: 50000, // $50,000 USD equivalent
        annual_limit: 200000, // $200,000 USD equivalent
        current_daily_spent: 0,
        current_monthly_spent: 0,
        current_annual_spent: 0
      },
      ...initialData
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .insert(newProfile)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  }

  /**
   * Update user limits (spending tracking)
   */
  async updateUserSpending(userId: string, amount: number): Promise<boolean> {
    const { data, error } = await supabase.rpc('update_user_spending', {
      p_user_id: userId,
      p_amount: amount
    });

    if (error) {
      console.error('Error updating user spending:', error);
      return false;
    }

    return true;
  }

  /**
   * Get user spending limits
   */
  async getUserLimits(userId: string): Promise<UserLimits | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('limits')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user limits:', error);
      return null;
    }

    return data?.limits || null;
  }

  /**
   * Check if user can make transaction
   */
  async canMakeTransaction(userId: string, amount: number): Promise<{ canProceed: boolean; reason?: string; remainingLimit: number }> {
    const limits = await this.getUserLimits(userId);
    if (!limits) {
      return { canProceed: false, reason: 'Unable to fetch user limits' };
    }

    // Check daily limit
    if (limits.current_daily_spent + amount > limits.daily_limit) {
      const remaining = limits.daily_limit - limits.current_daily_spent;
      return { 
        canProceed: false, 
        reason: `Daily limit exceeded. Remaining: ${remaining.toFixed(2)}`,
        remainingLimit: remaining
      };
    }

    // Check monthly limit
    if (limits.current_monthly_spent + amount > limits.monthly_limit) {
      const remaining = limits.monthly_limit - limits.current_monthly_spent;
      return { 
        canProceed: false, 
        reason: `Monthly limit exceeded. Remaining: ${remaining.toFixed(2)}`,
        remainingLimit: remaining
      };
    }

    // Check annual limit
    if (limits.current_annual_spent + amount > limits.annual_limit) {
      const remaining = limits.annual_limit - limits.current_annual_spent;
      return { 
        canProceed: false, 
        reason: `Annual limit exceeded. Remaining: ${remaining.toFixed(2)}`,
        remainingLimit: remaining
      };
    }

    return { canProceed: true, remainingLimit: limits.daily_limit - limits.current_daily_spent };
  }

  /**
   * Upload KYC document
   */
  async uploadKYCDocument(
    userId: string,
    documentType: KYCDocument['document_type'],
    files: {
      frontImage?: File;
      backImage?: File;
      selfie?: File;
    },
    documentNumber?: string
  ): Promise<{ success: boolean; document?: KYCDocument; error?: string }> {
    try {
      const documentId = crypto.randomUUID();
      const fileUrls: { [key: string]: string } = {};

      // Upload files to Supabase Storage
      for (const [key, file] of Object.entries(files)) {
        if (file) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${userId}/${documentType}/${documentId}_${key}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('kyc-documents')
            .upload(fileName, file);

          if (uploadError) {
            console.error(`Error uploading ${key}:`, uploadError);
            return { success: false, error: `Failed to upload ${key}` };
          }

          const { data: { publicUrl } } = supabase.storage
            .from('kyc-documents')
            .getPublicUrl(fileName);

          fileUrls[key] = publicUrl;
        }
      }

      // Create KYC document record
      const kycDocument: Partial<KYCDocument> = {
        id: documentId,
        user_id: userId,
        document_type: documentType,
        document_number: documentNumber,
        front_image_url: fileUrls.frontImage,
        back_image_url: fileUrls.backImage,
        selfie_url: fileUrls.selfie,
        status: 'uploaded',
        submitted_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('kyc_documents')
        .insert(kycDocument)
        .select()
        .single();

      if (error) {
        console.error('Error saving KYC document:', error);
        return { success: false, error: 'Failed to save document information' };
      }

      // Update user profile status
      await this.updateUserProfile(userId, {
        kyc_status: 'pending',
        verification_documents: {
          id_front: fileUrls.frontImage,
          id_back: fileUrls.backImage,
          selfie: fileUrls.selfie,
          address_proof: fileUrls.address_proof
        }
      });

      return { success: true, document: data };
    } catch (error) {
      console.error('Error in uploadKYCDocument:', error);
      return { success: false, error: 'Upload failed' };
    }
  }

  /**
   * Get KYC documents for user
   */
  async getKYCDocuments(userId: string): Promise<KYCDocument[]> {
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching KYC documents:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get user's KYC status summary
   */
  async getKYCStatus(userId: string): Promise<{
    status: 'pending' | 'verified' | 'rejected';
    level: 'basic' | 'intermediate' | 'full';
    documents: KYCDocument[];
    nextSteps?: string[];
  }> {
    const profile = await this.getUserProfile(userId);
    const documents = await this.getKYCDocuments(userId);
    
    if (!profile) {
      return { status: 'pending', level: 'basic', documents: [], nextSteps: ['Complete profile setup'] };
    }

    const nextSteps: string[] = [];
    
    if (profile.kyc_status === 'pending') {
      if (documents.length === 0) {
        nextSteps.push('Upload identification documents');
      }
      if (!profile.phone) {
        nextSteps.push('Add phone number');
      }
      if (!profile.full_name) {
        nextSteps.push('Add full name');
      }
    }

    return {
      status: profile.kyc_status,
      level: profile.kyc_level,
      documents,
      nextSteps: nextSteps.length > 0 ? nextSteps : undefined
    };
  }

  /**
   * Verify user phone number (SMS verification)
   */
  async verifyPhoneNumber(userId: string, phone: string, otp: string): Promise<boolean> {
    // This would integrate with your SMS service (e.g., Twilio)
    // For now, return a placeholder implementation
    console.log(`Verifying phone ${phone} with OTP ${otp} for user ${userId}`);
    return true; // Implement actual verification
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: {
    currency_preference?: string;
    language?: string;
    notifications_enabled?: boolean;
  }): Promise<boolean> {
    const updates: any = { updated_at: new Date().toISOString() };
    
    if (preferences.currency_preference) {
      updates.currency_preference = preferences.currency_preference;
    }
    
    if (preferences.language) {
      updates.language = preferences.language;
    }
    
    if (preferences.notifications_enabled !== undefined) {
      updates.notifications_enabled = preferences.notifications_enabled;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId);

    return !error;
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId: string): Promise<{
    totalTransactions: number;
    totalSpent: number;
    lastActivity: string;
    accountAge: number; // days
  }> {
    // This would aggregate data from transactions, wallet, etc.
    const { data, error } = await supabase.rpc('get_user_activity_summary', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error fetching user activity:', error);
      return {
        totalTransactions: 0,
        totalSpent: 0,
        lastActivity: 'Never',
        accountAge: 0
      };
    }

    return data || {
      totalTransactions: 0,
      totalSpent: 0,
      lastActivity: 'Never',
      accountAge: 0
    };
  }

  /**
   * Close/Deactivate user account
   */
  async deactivateAccount(userId: string, reason: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString(),
        deactivation_reason: reason 
      })
      .eq('user_id', userId);

    return !error;
  }
}

export const userService = new UserService();
export default userService;