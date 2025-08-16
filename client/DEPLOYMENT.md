# 🚀 Deploy to Cloudflare Pages with Supabase

## Prerequisites
- Cloudflare account
- Supabase project
- Your React app built (`npm run build`)

## Step 1: Get Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## Step 2: Configure Supabase in Your App

1. **Option A: Environment Variables (Recommended)**
   - Create a `.env` file in your `client` folder:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Option B: Config File**
   - Edit `src/config/supabase.js`
   - Replace placeholder values with your actual credentials

## Step 3: Build Your App

```bash
cd client
npm run build
```

## Step 4: Deploy to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Pages** → **Create a project**
3. Choose **Direct Upload**
4. **Project name**: `eggs-easter-eggs-app`
5. **Framework preset**: `None`
6. **Upload files**: Drag and drop contents of your `build` folder
7. Click **Deploy site**

## Step 5: Configure Routing

1. In your Pages project, go to **Settings** → **Functions**
2. Enable **Functions**
3. Go to **Settings** → **Pages**
4. Add redirect rule:
   ```
   /*    /index.html   200
   ```

## Step 6: Set Environment Variables (Optional)

1. In your Pages project, go to **Settings** → **Environment variables**
2. Add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

## Step 7: Test Your App

Your app will be live at: `https://your-project-name.pages.dev`

## 🔧 Important Notes

### Backend Removal
- **Delete** `server.js` (no longer needed)
- **Delete** `package-lock.json` in root folder
- **Delete** root `package.json`

### Supabase Setup
- Ensure your Supabase RLS policies allow:
  - Public read access to `easter_eggs` table
  - Authenticated users can create/update their own posts
  - Storage buckets are configured for public access

### File Uploads
- Update storage bucket names in `storageService.js`
- Ensure proper RLS policies for storage

## 🐛 Troubleshooting

### Common Issues
1. **CORS errors**: Check Supabase RLS policies
2. **Authentication fails**: Verify anon key is correct
3. **Routing issues**: Ensure redirect rule is set
4. **Build errors**: Check for missing dependencies

### Support
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Supabase Docs](https://supabase.com/docs)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/) 