/**
 * KYC Document Upload Component
 * 
 * Handles document upload, verification, and status tracking
 * for regulatory compliance with PesaPal and financial services.
 */

import React, { useState, useCallback } from 'react';
import { userService, type KYCDocument } from '../services/user.service';

interface KYCUploadPageProps {
  userId: string;
  onComplete?: (document: KYCDocument) => void;
}

interface UploadState {
  documentType: KYCDocument['document_type'];
  documentNumber: string;
  frontImage: File | null;
  backImage: File | null;
  selfieImage: File | null;
}

const KYCUploadPage: React.FC<KYCUploadPageProps> = ({ userId, onComplete }) => {
  const [state, setState] = useState<UploadState>({
    documentType: 'national_id',
    documentNumber: '',
    frontImage: null,
    backImage: null,
    selfieImage: null
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleFileChange = useCallback((fileType: 'frontImage' | 'backImage' | 'selfieImage', file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [fileType]: 'Please select an image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [fileType]: 'File size must be less than 5MB' }));
      return;
    }

    setErrors(prev => ({ ...prev, [fileType]: '' }));
    setState(prev => ({ ...prev, [fileType]: file }));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!state.documentNumber.trim()) {
      newErrors.documentNumber = 'Document number is required';
    }

    if (state.documentType === 'national_id' || state.documentType === 'passport') {
      if (!state.frontImage) {
        newErrors.frontImage = 'Front image is required';
      }
    } else if (state.documentType === 'drivers_license') {
      if (!state.frontImage) {
        newErrors.frontImage = 'Front image is required';
      }
      if (!state.backImage) {
        newErrors.backImage = 'Back image is required';
      }
    }

    if (!state.selfieImage) {
      newErrors.selfieImage = 'Selfie is required for verification';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await userService.uploadKYCDocument(userId, state.documentType, {
        frontImage: state.frontImage || undefined,
        backImage: state.backImage || undefined,
        selfie: state.selfieImage || undefined
      }, state.documentNumber);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.document) {
        onComplete?.(result.document);
        alert('Documents uploaded successfully! Review typically takes 24-48 hours.');
      } else {
        setErrors({ submit: result.error || 'Upload failed' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors({ submit: 'Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const documentTypeOptions = [
    { value: 'national_id', label: 'National ID', requiredFields: ['front', 'selfie'] },
    { value: 'passport', label: 'Passport', requiredFields: ['front', 'selfie'] },
    { value: 'drivers_license', label: 'Driver\'s License', requiredFields: ['front', 'back', 'selfie'] },
    { value: 'address_proof', label: 'Address Proof', requiredFields: ['document', 'selfie'] }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Identity Verification</h1>
        <p className="text-gray-600">
          Please upload your identification documents to complete verification. 
          All information is encrypted and securely processed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type *
          </label>
          <select
            value={state.documentType}
            onChange={(e) => setState(prev => ({ ...prev, documentType: e.target.value as KYCDocument['document_type'] }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {documentTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Document Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Number *
          </label>
          <input
            type="text"
            value={state.documentNumber}
            onChange={(e) => setState(prev => ({ ...prev, documentNumber: e.target.value }))}
            placeholder={`Enter your ${documentTypeOptions.find(opt => opt.value === state.documentType)?.label} number`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.documentNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.documentNumber}</p>
          )}
        </div>

        {/* Document Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Front Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Front *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              {state.frontImage ? (
                <div className="space-y-2">
                  <img 
                    src={URL.createObjectURL(state.frontImage)} 
                    alt="Document front" 
                    className="max-w-full h-32 object-cover mx-auto rounded"
                  />
                  <p className="text-sm text-green-600">✓ {state.frontImage.name}</p>
                  <button
                    type="button"
                    onClick={() => handleFileChange('frontImage', null as any)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-gray-600">
                    <label htmlFor="front-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium">Click to upload front</span>
                      <span className="mt-1 block text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
                    </label>
                    <input
                      id="front-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => e.target.files?.[0] && handleFileChange('frontImage', e.target.files[0])}
                    />
                  </div>
                </div>
              )}
            </div>
            {errors.frontImage && (
              <p className="mt-1 text-sm text-red-600">{errors.frontImage}</p>
            )}
          </div>

          {/* Back Image (if required) */}
          {state.documentType === 'drivers_license' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Back *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                {state.backImage ? (
                  <div className="space-y-2">
                    <img 
                      src={URL.createObjectURL(state.backImage)} 
                      alt="Document back" 
                      className="max-w-full h-32 object-cover mx-auto rounded"
                    />
                    <p className="text-sm text-green-600">✓ {state.backImage.name}</p>
                    <button
                      type="button"
                      onClick={() => setState(prev => ({ ...prev, backImage: null }))}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-gray-600">
                      <label htmlFor="back-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium">Click to upload back</span>
                      </label>
                      <input
                        id="back-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => e.target.files?.[0] && handleFileChange('backImage', e.target.files[0])}
                      />
                    </div>
                  </div>
                )}
              </div>
              {errors.backImage && (
                <p className="mt-1 text-sm text-red-600">{errors.backImage}</p>
              )}
            </div>
          )}

          {/* Selfie */}
          <div className={state.documentType === 'drivers_license' ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selfie Photo *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              {state.selfieImage ? (
                <div className="space-y-2">
                  <img 
                    src={URL.createObjectURL(state.selfieImage)} 
                    alt="Selfie" 
                    className="max-w-full h-32 object-cover mx-auto rounded"
                  />
                  <p className="text-sm text-green-600">✓ {state.selfieImage.name}</p>
                  <button
                    type="button"
                    onClick={() => setState(prev => ({ ...prev, selfieImage: null }))}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-gray-600">
                    <label htmlFor="selfie-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium">Click to upload selfie</span>
                      <span className="mt-1 block text-xs text-gray-500">Look at camera, good lighting</span>
                    </label>
                    <input
                      id="selfie-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => e.target.files?.[0] && handleFileChange('selfieImage', e.target.files[0])}
                    />
                  </div>
                </div>
              )}
            </div>
            {errors.selfieImage && (
              <p className="mt-1 text-sm text-red-600">{errors.selfieImage}</p>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Uploading documents...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Submit for Review'}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Documents are securely encrypted and reviewed</li>
          <li>• Review typically takes 24-48 hours</li>
          <li>• You'll receive email updates on your verification status</li>
          <li>• Higher verification levels unlock higher transaction limits</li>
        </ul>
      </div>
    </div>
  );
};

export default KYCUploadPage;