import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from auth header
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get purchase details
    const { data: purchase, error: purchaseError } = await supabase
      .from('token_purchases')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    if (purchase.payment_status !== 'pending') {
      return NextResponse.json({ error: 'Purchase already processed' }, { status: 400 })
    }

    // Verify payment with Flutterwave (in production)
    // For now, simulate successful payment verification

    // Update purchase status
    const { data: updatedPurchase, error: updateError } = await supabase
      .from('token_purchases')
      .update({
        payment_status: 'completed',
        completed_at: new Date().toISOString(),
        payment_reference: `payment_${Date.now()}`
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Purchase completion error:', updateError)
      return NextResponse.json({ error: 'Failed to complete purchase' }, { status: 500 })
    }

    // Get current wallet balance
    const { data: currentWallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('id', purchase.wallet_id)
      .single()

    const newBalance = (currentWallet?.balance || 0) + purchase.act_amount

    // Update wallet balance with new ACT tokens
    const { error: balanceError } = await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('id', purchase.wallet_id)

    if (balanceError) {
      console.error('Wallet balance update error:', balanceError)
      return NextResponse.json({ error: 'Failed to update wallet balance' }, { status: 500 })
    }

    // Create transaction record for the ACT tokens
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        to_user_id: user.id,
        to_wallet_id: purchase.wallet_id,
        amount: purchase.act_amount,
        transaction_type: 'deposit',
        status: 'completed',
        description: `ACT token purchase - ${purchase.id}`,
        metadata: {
          purchase_id: purchase.id,
          fiat_amount: purchase.fiat_amount,
          fiat_currency: purchase.fiat_currency,
          payment_method: purchase.payment_method,
          previous_balance: currentWallet?.balance || 0,
          new_balance: newBalance
        }
      })

    if (transactionError) {
      console.error('Transaction creation error:', transactionError)
      // Don't fail the entire process if transaction creation fails
    }

    // Generate receipt number
    const receiptNumber = `ACT-${Date.now()}-${params.id.slice(-6).toUpperCase()}`
    const { error: receiptError } = await supabase
      .from('purchase_receipts')
      .insert({
        purchase_id: purchase.id,
        receipt_number: receiptNumber
      })

    if (receiptError) {
      console.error('Receipt creation error:', receiptError)
      // Don't fail the entire process if receipt creation fails
    }

    return NextResponse.json({
      success: true,
      purchase: updatedPurchase,
      receipt_number: receiptNumber
    })

  } catch (error) {
    console.error('Purchase completion API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}