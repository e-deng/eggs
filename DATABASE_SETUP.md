# Database Setup for User Authentication

## Required Tables

### 1. Users Table
```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. User Likes Table
```sql
-- Create user_likes table to track individual user likes
CREATE TABLE user_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  easter_egg_id UUID REFERENCES easter_eggs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, easter_egg_id) -- Prevents multiple likes per user per post
);

-- Enable RLS
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all likes" ON user_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON user_likes
  FOR ALL USING (auth.uid() = user_id);
```

### 3. Update Easter Eggs Table
```sql
-- Add user_id and username columns to easter_eggs table
ALTER TABLE easter_eggs 
ADD COLUMN user_id UUID,
ADD COLUMN username VARCHAR;

-- Create a default anonymous user for existing data
INSERT INTO users (id, username, created_at) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Anonymous', NOW())
ON CONFLICT (id) DO NOTHING;

-- Update existing easter eggs to have the anonymous user
UPDATE easter_eggs 
SET user_id = '00000000-0000-0000-0000-000000000000', 
    username = 'Anonymous' 
WHERE user_id IS NULL;

-- Now make user_id required for new entries
ALTER TABLE easter_eggs ALTER COLUMN user_id SET NOT NULL;
```

### 4. Update Comments Table
```sql
-- Add user_id and username columns to comments table
ALTER TABLE comments 
ADD COLUMN user_id UUID,
ADD COLUMN username VARCHAR;

-- Update existing comments to have the anonymous user
UPDATE comments 
SET user_id = '00000000-0000-0000-0000-000000000000', 
    username = 'Anonymous' 
WHERE user_id IS NULL;

-- Make user_id required for new entries
ALTER TABLE comments ALTER COLUMN user_id SET NOT NULL;
```

## Alternative: Clean Slate Approach

If you prefer to start fresh, you can drop and recreate the tables:

```sql
-- Drop existing tables (WARNING: This will delete all data!)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS easter_eggs CASCADE;

-- Recreate easter_eggs table with user_id
CREATE TABLE easter_eggs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  album VARCHAR(100),
  media_type VARCHAR(100),
  clue_type VARCHAR(100),
  image_url TEXT,
  upvotes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  user_id UUID NOT NULL REFERENCES users(id),
  username VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate comments table with user_id
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  easter_egg_id UUID NOT NULL REFERENCES easter_eggs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  username VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Supabase Auth Setup

1. **Enable Email Auth** in Supabase Dashboard
2. **Disable Email Confirmation** (since we're using fake emails)
3. **Set Site URL** to your domain
4. **Configure Auth Settings** as needed

## Testing the Setup

After running these SQL commands:

1. **Register a user** using `/api/auth/register`
2. **Login** using `/api/auth/login`
3. **Create an Easter egg** (requires authentication)
4. **Add comments** (requires authentication)
5. **Like/unlike posts** (requires authentication)

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User authentication** required for posting, commenting, and liking
- **One like per user per post** enforced by database constraint
- **Token-based authentication** using Supabase Auth
- **Username uniqueness** enforced at database level