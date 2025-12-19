-- Add upi_id column if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS upi_id TEXT UNIQUE;

-- Optional: Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_upi_id ON public.users(upi_id);
