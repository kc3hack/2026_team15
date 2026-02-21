import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type CreatePaymentIntentBody = {
  penaltyPerDay?: number
  contractDays?: number
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: "missing_supabase_env" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "missing_stripe_secret_key" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    // Auth validation
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "missing_authorization_header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: authData, error: authError } = await authClient.auth.getUser()
    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: "invalid_user_token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const body = await req.json() as CreatePaymentIntentBody
    const penaltyPerDay = body.penaltyPerDay
    const contractDays = body.contractDays ?? 7

    if (
      !penaltyPerDay ||
      penaltyPerDay < 500 ||
      penaltyPerDay > 2000 ||
      penaltyPerDay % 100 !== 0
    ) {
      return new Response(
        JSON.stringify({ error: "invalid_penalty_per_day" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }
    if (contractDays !== 7) {
      return new Response(
        JSON.stringify({ error: "invalid_contract_days" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const amount = penaltyPerDay * contractDays
    const currency = "jpy"

    // Create PaymentIntent via Stripe API
    const stripeResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: amount.toString(),
        currency: currency,
        "metadata[user_id]": authData.user.id,
        "metadata[penalty_per_day]": penaltyPerDay.toString(),
        "metadata[contract_days]": contractDays.toString(),
        "automatic_payment_methods[enabled]": "true",
      }).toString(),
    })

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json()
      console.error("[Stripe Error]", errorData)
      return new Response(
        JSON.stringify({ error: "stripe_error", details: errorData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const paymentIntent = await stripeResponse.json()

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("[Error]", error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
