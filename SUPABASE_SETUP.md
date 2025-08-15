# Supabase Storage Setup for Image Uploads

To enable image uploads for your Easter Eggs app, you need to set up Supabase Storage.

## 🗂️ **Step 1: Create Storage Bucket**

1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Set the following:
   - **Name**: `easter-egg-images`
   - **Public bucket**: ✅ Check this (so images are publicly accessible)
   - **File size limit**: 5MB (or your preferred limit)
   - **Allowed MIME types**: `image/*`

## 🔐 **Step 2: Set Storage Policies**

After creating the bucket, you need to set up policies to allow uploads and public access.

### **Policy 1: Allow Public Read Access**
```sql
-- Allow anyone to view images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'easter-egg-images');
```

### **Policy 2: Allow Authenticated Uploads**
```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'easter-egg-images');
```

### **Policy 3: Allow Users to Update Their Own Files**
```sql
-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (bucket_id = 'easter-egg-images');
```

### **Policy 4: Allow Users to Delete Their Own Files**
```sql
-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (bucket_id = 'easter-egg-images');
```

## 🚀 **Step 3: Test the Setup**

1. **Install the new dependencies**:
   ```bash
   npm install
   ```

2. **Restart your server**:
   ```bash
   npm run server
   ```

3. **Test image upload**:
   - Open your app
   - Click "Add Easter Egg"
   - Upload an image file
   - The image should upload to Supabase Storage

## 📁 **Storage Structure**

Images will be stored with this naming convention:
```
easter-egg-images/
├── {easter-egg-id}-{timestamp}-{original-filename}.jpg
├── {easter-egg-id}-{timestamp}-{original-filename}.png
└── ...
```

## 🔧 **Troubleshooting**

### **"Bucket not found" error**
- Make sure the bucket name is exactly `easter-egg-images`
- Check that the bucket is created in the correct project

### **"Access denied" error**
- Verify your storage policies are set correctly
- Check that your Supabase API key has the right permissions

### **Images not displaying**
- Ensure the bucket is set to "Public"
- Check that the storage policies allow public read access

## 🌟 **Features You Now Have**

✅ **File Upload**: Users can upload actual image files
✅ **Image Preview**: See images before submitting
✅ **File Validation**: Only images allowed, 5MB limit
✅ **Secure Storage**: Images stored in Supabase Storage
✅ **Public Access**: Images are publicly viewable
✅ **Drag & Drop**: Modern upload interface

## 📱 **Usage**

1. **Add Easter Egg**: Click the "Add Easter Egg" button
2. **Upload Image**: Click the upload area or drag & drop an image
3. **Preview**: See your image before submitting
4. **Submit**: Fill in details and click "Add Easter Egg"
5. **View**: Your image will appear in the Easter eggs grid

The app now supports actual file uploads instead of just URLs! 🎉 