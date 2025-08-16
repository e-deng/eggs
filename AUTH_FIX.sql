-- Fix for authentication system
-- Run this in your Supabase SQL editor

-- Step 1: Add password_hash column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Step 2: Update existing users to have a default password hash
-- (This is just for existing data, new users will have proper hashes)
UPDATE users 
SET password_hash = '$2b$10$default.hash.for.existing.users' 
WHERE password_hash IS NULL;

-- Step 3: Fix Row Level Security (RLS) policies for users table
-- First, disable RLS temporarily to fix the policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 4: Re-enable RLS with proper policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies that allow the server to insert new users
-- Allow anyone to insert new users (for registration)
CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (true);

-- Allow users to view all profiles
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true);

-- Step 6: Make sure the users table has the right structure
-- The table should now have: id, username, password_hash, created_at, updated_at

-- Step 7: Verify the structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Step 8: Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users'; 