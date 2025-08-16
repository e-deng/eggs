-- Quick Fix for null user_id issue
-- Run this in your Supabase SQL editor

-- Step 1: Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create a default anonymous user
INSERT INTO users (id, username, created_at) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Anonymous', NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 3: Add user_id and username columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'easter_eggs' AND column_name = 'user_id') THEN
        ALTER TABLE easter_eggs ADD COLUMN user_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'easter_eggs' AND column_name = 'username') THEN
        ALTER TABLE easter_eggs ADD COLUMN username VARCHAR;
    END IF;
END $$;

-- Step 4: Update existing easter eggs to have the anonymous user
UPDATE easter_eggs 
SET user_id = '00000000-0000-0000-0000-000000000000', 
    username = 'Anonymous' 
WHERE user_id IS NULL;

-- Step 5: Now make user_id required
ALTER TABLE easter_eggs ALTER COLUMN user_id SET NOT NULL;

-- Step 6: Add the same for comments table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'user_id') THEN
        ALTER TABLE comments ADD COLUMN user_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'username') THEN
        ALTER TABLE comments ADD COLUMN username VARCHAR;
    END IF;
END $$;

-- Step 7: Update existing comments
UPDATE comments 
SET user_id = '00000000-0000-0000-0000-000000000000', 
    username = 'Anonymous' 
WHERE user_id IS NULL;

-- Step 8: Make user_id required for comments
ALTER TABLE comments ALTER COLUMN user_id SET NOT NULL;

-- Step 9: Remove the redundant author column if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'author') THEN
        ALTER TABLE comments DROP COLUMN author;
    END IF;
END $$;

-- Step 9: Verify the fix
SELECT 
    'easter_eggs' as table_name,
    COUNT(*) as total_rows,
    COUNT(user_id) as rows_with_user_id,
    COUNT(*) - COUNT(user_id) as rows_without_user_id
FROM easter_eggs
UNION ALL
SELECT 
    'comments' as table_name,
    COUNT(*) as total_rows,
    COUNT(user_id) as rows_with_user_id,
    COUNT(*) - COUNT(user_id) as rows_without_user_id
FROM comments; 