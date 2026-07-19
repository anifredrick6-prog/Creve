import { createClient } from '@supabase/supabase-js'

const PLAN_AMOUNT_KOBO = 100000 // ₦1,000 — change here to adjust the plan price

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { reference, userId } = req.body ?? {}

  if (!reference || !userId) {
    return res.status(400).json({ error: 'Missing reference or userId' })
  }

  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    )
    const paystackData = await paystackRes.json()

    if (!paystackData.status || paystackData.data?.status !== 'success') {
      return res.status(400).json({ error: 'Payment could not be verified.' })
    }

    if (paystackData.data.amount < PLAN_AMOUNT_KOBO) {
      return res.status(400).json({ error: 'Payment amount does not match the plan price.' })
    }

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Extend from "now", not from any existing subscribed_until, to keep
    // this simple — renewing early just resets the clock a month out.
    const subscribedUntil = new Date()
    subscribedUntil.setMonth(subscribedUntil.getMonth() + 1)

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ subscribed_until: subscribedUntil.toISOString() })
      .eq('id', userId)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({
      success: true,
      subscribed_until: subscribedUntil.toISOString(),
    })
  } catch (err) {
    return res.status(500).json({ error: err.message ?? 'Unexpected error' })
  }
}
