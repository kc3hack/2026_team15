import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type CreateContractBody = {
  dailyLimitSeconds: number
  depositTotal: number
  selectedApps: Array<{
    bundleId: string
    name: string
    category?: string
  }>
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

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: "missing_supabase_env" }),
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

    const userId = authData.user.id
    const body = await req.json() as CreateContractBody
    const { dailyLimitSeconds, depositTotal, selectedApps, contractDays = 7 } = body

    if (!dailyLimitSeconds || dailyLimitSeconds <= 0) {
      return new Response(
        JSON.stringify({ error: "invalid_daily_limit" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    // Use service role for database operations
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Calculate contract dates
    const now = new Date()
    const endAt = new Date(now)
    endAt.setDate(endAt.getDate() + contractDays)

    // Create contract
    const { data: contract, error: contractError } = await adminClient
      .from("contracts")
      .insert({
        user_id: userId,
        start_at: now.toISOString(),
        end_at: endAt.toISOString(),
        daily_limit_seconds: dailyLimitSeconds,
        deposit_total: depositTotal,
        selected_apps: selectedApps,
        status: "active",
      })
      .select()
      .single()

    if (contractError || !contract) {
      console.error("[Contract Error]", contractError)
      return new Response(
        JSON.stringify({ error: "failed_to_create_contract", details: contractError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    // Record deposit in ledger
    const { error: ledgerError } = await adminClient
      .from("ledger_entries")
      .insert({
        user_id: userId,
        contract_id: contract.id,
        type: "deposit",
        amount: depositTotal,
        local_date: now.toISOString().split("T")[0],
        note: "initial deposit",
      })

    if (ledgerError) {
      console.error("[Ledger Error]", ledgerError)
      // Don't fail the request, just log the error
    }

    return new Response(
      JSON.stringify({
        success: true,
        contract: {
          id: contract.id,
          startAt: contract.start_at,
          endAt: contract.end_at,
          dailyLimitSeconds: contract.daily_limit_seconds,
          depositTotal: contract.deposit_total,
          selectedApps: contract.selected_apps,
          status: contract.status,
        },
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
