/**
 * ACT Purchase Callback Page - PesaPal Integration
 * 
 * This page handles the callback from PesaPal after payment completion.
 * It verifies the payment status and either shows success or error.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { actPaymentService, type PesaPalTransactionStatus } from '../services/act-payment.service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CallbackPageProps {
  user?: {
    id: string;
    email: string;
  };
}

const ACTPurchaseCallbackPage: React.FC<CallbackPageProps> = ({ user }) => {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'processing'>('loading');
  const [paymentData, setPaymentData] = useState<{
    orderTrackingId?: string;
    merchantReference?: string;
    message?: string;
  }>({});
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const { orderTrackingId, orderMerchantReference } = router.query;

      if (!orderTrackingId) {
        throw new Error('No order tracking ID received from PesaPal');
      }

      console.log('Processing PesaPal callback:', { orderTrackingId, orderMerchantReference });

      setPaymentData({
        orderTrackingId: orderTrackingId as string,
        merchantReference: orderMerchantReference as string
      });

      // Verify payment status with PesaPal
      const transactionStatus: PesaPalTransactionStatus = await actPaymentService.verifyPayment(
        orderTrackingId as string
      );

      console.log('Transaction status:', transactionStatus);

      // Find the purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('token_purchases')
        .select('*, wallets(*)')
        .eq('pesapal_order_tracking_id', orderTrackingId)
        .single();

      if (purchaseError || !purchase) {
        throw new Error('Purchase record not found');
      }

      setPurchaseDetails(purchase);

      // Update purchase status based on PesaPal response
      const pesapalStatus = transactionStatus.payment_status_description.toLowerCase();
      let newPaymentStatus: string;
      let newStep: 'success' | 'error' | 'processing' = 'processing';

      switch (pesapalStatus) {
        case 'completed':
        case 'successful':
          newPaymentStatus = 'completed';
          newStep = 'success';
          
          // Process the purchase and credit tokens
          try {
            const success = await actPaymentService.completePurchase(purchase.id, transactionStatus);
            if (success) {
              // Get updated wallet balance
              const balance = await actPaymentService.getWalletBalance(purchase.user_id);
              if (balance) {
                setWalletBalance(balance.balance);
              }
            }
          } catch (processError) {
            console.error('Failed to process completed purchase:', processError);
            // Continue with success display even if processing fails
          }
          break;
          
        case 'failed':
        case 'invalid':
          newPaymentStatus = 'failed';
          newStep = 'error';
          break;
          
        case 'pending':
        case 'processing':
          newPaymentStatus = 'processing';
          newStep = 'processing';
          break;
          
        default:
          newPaymentStatus = 'unknown';
          newStep = 'error';
      }

      // Update purchase status in database
      await supabase
        .from('token_purchases')
        .update({
          payment_status: newPaymentStatus,
          pesapal_status: transactionStatus.payment_status_description,
          confirmation_code: transactionStatus.confirmation_code,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchase.id);

      setStatus(newStep);

    } catch (error) {
      console.error('Callback processing error:', error);
      setStatus('error');
      setPaymentData(prev => ({
        ...prev,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }));
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'processing':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'processing':
        return '⏳';
      default:
        return '🔄';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return 'Payment Successful!';
      case 'error':
        return 'Payment Failed';
      case 'processing':
        return 'Payment Processing';
      default:
        return 'Verifying Payment...';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Your Payment</h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment status with PesaPal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Status Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{getStatusIcon()}</div>
          <h1 className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
            {getStatusMessage()}
          </h1>
          {paymentData.message && (
            <p className="text-gray-600">{paymentData.message}</p>
          )}
        </div>

        {/* Payment Details */}
        {paymentData.orderTrackingId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-xs">{paymentData.orderTrackingId}</span>
              </div>
              {paymentData.merchantReference && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-mono text-xs">{paymentData.merchantReference}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium">PesaPal</span>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Details */}
        {purchaseDetails && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-3">Purchase Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">ACT Tokens:</span>
                <span className="font-bold text-blue-900">
                  {purchaseDetails.act_amount.toFixed(7)} ACT
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Amount Paid:</span>
                <span className="font-medium text-blue-900">
                  {purchaseDetails.fiat_currency} {purchaseDetails.fiat_amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Payment Method:</span>
                <span className="capitalize font-medium text-blue-900">
                  {purchaseDetails.payment_method.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Success Content */}
        {status === 'success' && (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="text-green-600 mb-2">🎉</div>
              <h3 className="font-medium text-green-800 mb-2">ACT Tokens Credited!</h3>
              <p className="text-green-700 text-sm mb-3">
                Your ACT tokens have been successfully added to your wallet.
              </p>
              {walletBalance > 0 && (
                <div className="bg-green-100 rounded p-2">
                  <span className="text-green-800 font-medium">
                    New Balance: {walletBalance.toFixed(7)} ACT
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/wallet')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                View My Wallet
              </button>
              <button
                onClick={() => router.push('/buy-act')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buy More ACT Tokens
              </button>
            </div>
          </div>
        )}

        {/* Error Content */}
        {status === 'error' && (
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-600 mb-2">⚠️</div>
              <h3 className="font-medium text-red-800 mb-2">Payment Issue</h3>
              <p className="text-red-700 text-sm">
                We couldn't complete your payment. This could be due to insufficient funds,
                network issues, or payment cancellation.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/buy-act')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/support')}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}

        {/* Processing Content */}
        {status === 'processing' && (
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="text-yellow-600 mb-2">⏳</div>
              <h3 className="font-medium text-yellow-800 mb-2">Payment Under Review</h3>
              <p className="text-yellow-700 text-sm">
                Your payment is still being processed. You'll receive an email confirmation
                once it's complete.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Check Status Again
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6 pt-4 border-t">
          <p>Secure payments powered by PesaPal</p>
          <p className="mt-1">
            Transaction ID: {paymentData.orderTrackingId || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ACTPurchaseCallbackPage;