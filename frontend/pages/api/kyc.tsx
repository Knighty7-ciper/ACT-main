/**
 * API Route - KYC Verification Operations
 * Handle KYC document upload, verification status, and KYC requests
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (req.method === 'GET') {
      // Get KYC status and documents
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        return res.status(500).json({ error: 'Failed to fetch KYC data' });
      }

      return res.status(200).json({
        kyc_status: profile.kyc_status,
        kyc_level: profile.kyc_level,
        verification_documents: profile.verification_documents,
        limits: profile.limits
      });
    }

    if (req.method === 'POST') {
      // Submit KYC request
      const { verification_documents, kyc_level = 'basic' } = req.body;

      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          verification_documents,
          kyc_status: 'pending',
          kyc_level,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update KYC status' });
      }

      // Create KYC request record
      const { error: requestError } = await supabase
        .from('kyc_requests')
        .insert({
          user_id: user.id,
          request_type: 'kyc_verification',
          title: 'KYC Verification Request',
          description: 'User has submitted documents for KYC verification',
          priority: 'medium',
          status: 'pending',
          requested_changes: {
            documents: verification_documents,
            kyc_level
          }
        });

      if (requestError) {
        return res.status(500).json({ error: 'Failed to create KYC request' });
      }

      return res.status(200).json({ message: 'KYC request submitted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('KYC API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}