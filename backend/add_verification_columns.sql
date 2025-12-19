-- Add verification columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code text;

-- Optional: Reset existing demo users to verified so they don't get locked out
UPDATE users SET is_verified = true WHERE is_verified IS NULL;
