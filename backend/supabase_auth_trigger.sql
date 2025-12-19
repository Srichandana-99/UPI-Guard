-- triggers on auth.users to create public.users profile

-- 0. Make password optional (handled by Supabase Auth now)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- 1. Create the function that will run on new user creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, name, upi_id, balance, is_verified)
  values (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'User'), -- Fallback if name is missing (e.g. Magic Link)
    SPLIT_PART(new.email, '@', 1) || '@siri', -- Auto-generate UPI ID
    floor(random() * (800000 - 200000 + 1) + 200000), -- Random Balance between 2L and 8L
    true     -- Supabase Auth handles verification, so we mark our table true
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
