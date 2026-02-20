# YOHAKU Design Doc (Current MVP)

## 1. Product Goal

YOHAKU is a demo-oriented iOS app that helps users create "time margin" by combining:

- app usage limits
- a 7-day contract
- penalty/deposit accounting (mock payment)

The current implementation prioritizes flow consistency and demo reliability.

## 2. Current Scope

- Platform: iOS (React Native app)
- Auth: Supabase anonymous session
- Contract model: one active contract per user
- Violation model: one violation per contract per local day
- Date basis: mock day in app (for demo progression)
- Shield: pseudo shield UI flow (not OS-enforced lock)

## 3. System Overview

### Mobile (React Native)

- Screen flow and UI
- Mock usage simulation and mock-day progression
- Supabase integration for contract/violation persistence
- Dashboard rendering based on synchronized contract + ledger state

### Supabase

- Auth (anonymous)
- Postgres tables: `profiles`, `contracts`, `violations`, `ledger_entries`
- RPC: `record_violation(...)` for idempotent penalty recording
- Edge Functions:
  - `create-contract`
  - `record-violation`
  - `create-payment-intent` (test payment path)

## 4. Data and Constraints

### Core constraints

- one active contract per user (partial unique index)
- one violation per contract per day (`unique(contract_id, date)`)
- ledger as source for balance and penalty sum

### Contract lifecycle

1. Create contract (7 days)
2. Record violations daily (idempotent)
3. Contract transitions to completed when period ends
4. New contract can start after completion

## 5. Key Implementation Decisions

### 5.1 Mock-day unified behavior

To avoid demo inconsistencies, contract and violation flows now use mock-day basis:

- client sends `clientNowIso` and `clientLocalDate` when creating contract
- edge function uses those fields to determine contract period and ledger local date
- expired active contract is auto-completed before creating/reusing contract

### 5.2 Post-create synchronization

After contract creation, app synchronizes:

- active contract in local mock store
- violations and ledger entries for dashboard consistency

### 5.3 Startup restoration

On login/launch, app checks Supabase active contract and routes to Dashboard when found.

## 6. Out of Scope (Current MVP)

- Sign in with Apple production auth flow
- OS-level Screen Time shield enforcement
- real payment settlement/refund
- multi-platform (Android/Web)

## 7. Known Trade-offs

- Pseudo shield is UX-level and not iOS system lock
- network-dependent synchronization can cause short UI lag
- demo mode prioritizes deterministic date progression over real-time behavior

## 8. References

- Build steps: `docs/build-guide.md`
- iOS capability notes: `docs/ios-capabilities.md`
