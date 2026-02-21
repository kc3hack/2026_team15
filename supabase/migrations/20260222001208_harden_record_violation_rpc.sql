revoke execute on function public.record_violation(uuid, uuid, date, timestamptz) from authenticated;
grant execute on function public.record_violation(uuid, uuid, date, timestamptz) to service_role;
