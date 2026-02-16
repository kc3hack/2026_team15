create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  apple_user_id text,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  daily_limit_seconds integer not null check (daily_limit_seconds > 0),
  penalty_per_day integer not null default 500 check (penalty_per_day > 0),
  deposit_total integer not null default 3500 check (deposit_total >= 0),
  status text not null default 'active' check (status in ('active', 'completed', 'canceled')),
  selected_apps jsonb not null default '[]'::jsonb,
  selected_categories jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);

create unique index if not exists contracts_one_active_per_user_idx
on public.contracts (user_id)
where status = 'active';

create index if not exists contracts_user_status_idx
on public.contracts (user_id, status);

drop trigger if exists trg_contracts_set_updated_at on public.contracts;
create trigger trg_contracts_set_updated_at
before update on public.contracts
for each row
execute procedure public.set_updated_at();

create table if not exists public.violations (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  exceeded_at timestamptz not null default now(),
  penalty_amount integer not null check (penalty_amount > 0),
  created_at timestamptz not null default now(),
  unique (contract_id, date)
);

create index if not exists violations_user_date_idx
on public.violations (user_id, date);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  contract_id uuid not null references public.contracts (id) on delete cascade,
  type text not null check (type in ('deposit', 'penalty', 'refund_mock')),
  amount integer not null,
  local_date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists ledger_contract_date_idx
on public.ledger_entries (contract_id, local_date);

alter table public.profiles enable row level security;
alter table public.contracts enable row level security;
alter table public.violations enable row level security;
alter table public.ledger_entries enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists contracts_select_own on public.contracts;
create policy contracts_select_own
on public.contracts
for select
using (auth.uid() = user_id);

drop policy if exists contracts_insert_own on public.contracts;
create policy contracts_insert_own
on public.contracts
for insert
with check (auth.uid() = user_id);

drop policy if exists contracts_update_own on public.contracts;
create policy contracts_update_own
on public.contracts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists violations_select_own on public.violations;
create policy violations_select_own
on public.violations
for select
using (auth.uid() = user_id);

drop policy if exists ledger_select_own on public.ledger_entries;
create policy ledger_select_own
on public.ledger_entries
for select
using (auth.uid() = user_id);

drop policy if exists ledger_insert_own on public.ledger_entries;
create policy ledger_insert_own
on public.ledger_entries
for insert
with check (auth.uid() = user_id and type in ('deposit', 'refund_mock'));

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.contracts to authenticated;
grant select on public.violations to authenticated;
grant select, insert on public.ledger_entries to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

create or replace function public.record_violation(
  p_contract_id uuid,
  p_user_id uuid,
  p_local_date date,
  p_exceeded_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_penalty integer;
  v_status text;
  v_violation_id uuid;
  v_balance integer;
begin
  select penalty_per_day, status
    into v_penalty, v_status
  from public.contracts
  where id = p_contract_id
    and user_id = p_user_id
  for update;

  if not found then
    raise exception 'contract_not_found_for_user';
  end if;

  if v_status <> 'active' then
    return jsonb_build_object(
      'violation_applied', false,
      'reason', 'contract_not_active'
    );
  end if;

  insert into public.violations (
    contract_id,
    user_id,
    date,
    exceeded_at,
    penalty_amount
  )
  values (
    p_contract_id,
    p_user_id,
    p_local_date,
    coalesce(p_exceeded_at, now()),
    v_penalty
  )
  on conflict (contract_id, date) do nothing
  returning id into v_violation_id;

  if v_violation_id is not null then
    insert into public.ledger_entries (
      user_id,
      contract_id,
      type,
      amount,
      local_date,
      note
    )
    values (
      p_user_id,
      p_contract_id,
      'penalty',
      -v_penalty,
      p_local_date,
      'daily limit exceeded'
    );
  end if;

  select coalesce(sum(amount), 0)
    into v_balance
  from public.ledger_entries
  where contract_id = p_contract_id;

  return jsonb_build_object(
    'violation_applied', v_violation_id is not null,
    'penalty_amount', case when v_violation_id is not null then v_penalty else 0 end,
    'balance', v_balance,
    'local_date', p_local_date
  );
end;
$$;

revoke all on function public.record_violation(uuid, uuid, date, timestamptz) from public;
grant execute on function public.record_violation(uuid, uuid, date, timestamptz) to authenticated, service_role;
