import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { amount, payment_method, phone_number } = await request.json()
    
    // Get user from auth header
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Calculate ACT amount based on current rate ($1.24)
    const ACT_RATE_USD = 1.24
    const usd_amount = amount / 130 // Approximate KES to USD (adjust as needed)
    const act_amount = usd_amount / ACT_RATE_USD

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('token_purchases')
      .insert({
        user_id: user.id,
        payment_provider: 'flutterwave',
        payment_method: payment_method,
        fiat_amount: amount,
        fiat_currency: 'KES',
        act_amount: act_amount,
        act_rate_usd: ACT_RATE_USD,
        payment_status: 'pending',
        wallet_id: wallet.id
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Purchase creation error:', purchaseError)
      return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 })
    }

    // Generate Flutterwave payment session
    const flutterwavePayload = {
      tx_ref: `purchase_${purchase.id}`,
      amount: amount,
      currency: 'KES',
      redirect_url: `${process.env.NEXT_PUBLIC_URL}/buy-act/success?tx_ref=${purchase.id}`,
      customer: {
        email: user.email,
        phone_number: phone_number
      },
      customizations: {
        title: 'Buy ACT Tokens - PESA-AFRIK',
        description: `Purchase ${act_amount.toFixed(7)} ACT tokens`,
        logo: 'https://pesa-afrik.com/logo.png'
      },
      payment_options: payment_method
    }

    // Note: In production, you'd call Flutterwave API here
    // For now, we'll return the purchase data and simulate payment
    return NextResponse.json({
      success: true,
      purchase: {
        id: purchase.id,
        act_amount: act_amount,
        fiat_amount: amount,
        fiat_currency: 'KES',
        payment_method: payment_method,
        status: 'pending'
      },
      // In production, this would be the Flutterwave payment URL
      payment_url: `${process.env.NEXT_PUBLIC_URL}/buy-act/confirm/${purchase.id}`
    })

  } catch (error) {
    console.error('Purchase API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}