const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('public'));

// Supabase configuration
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.error("Please create a .env file with:");
  console.error("NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url");
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to upload image to Supabase Storage
async function uploadImageToStorage(file, easterEggId) {
  try {
    const fileName = `${easterEggId}-${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from('easter-egg-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('easter-egg-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image to Supabase Storage:', error);
    throw error;
  }
}

// Helper function to upload video to Supabase Storage
async function uploadVideoToStorage(file, easterEggId) {
  try {
    const fileName = `${easterEggId}-${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from('easter-egg-videos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('easter-egg-videos')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading video to Supabase Storage:', error);
    throw error;
  }
}

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.split(' ')[1]
    
    // Decode the simple token
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [userId, timestamp] = decoded.split(':')
      
      // Check if token is not too old (24 hours)
      const tokenAge = Date.now() - parseInt(timestamp)
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return res.status(401).json({ error: 'Token expired' })
      }

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError || !userProfile) {
        return res.status(404).json({ error: 'User profile not found' })
      }

      req.user = userProfile
      next()
    } catch (decodeError) {
      return res.status(401).json({ error: 'Invalid token format' })
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// API Routes
app.get('/api/easter-eggs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('easter_eggs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Easter eggs:', error);
      return res.status(500).json({ error: 'Failed to fetch Easter eggs' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error in /api/easter-eggs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update the POST /api/easter-eggs endpoint to require authentication
app.post('/api/easter-eggs', authenticateUser, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    let imageUrl = null;
    let videoUrl = null;
    
    if (req.files && req.files.image) {
      imageUrl = await uploadImageToStorage(req.files.image[0], 'temp'); // Upload with temp ID
    }
    
    if (req.files && req.files.video) {
      videoUrl = await uploadVideoToStorage(req.files.video[0], 'temp'); // Upload with temp ID
    }

    const easterEggData = {
      ...req.body,
      user_id: req.user.id,
      username: req.user.username,
      image_url: imageUrl || req.body.image_url,
      video_url: videoUrl || req.body.video_url,
      upvotes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('easter_eggs').insert([easterEggData]).select().single();
    if (error) {
      console.error('Error inserting Easter egg:', error);
      return res.status(500).json({ error: 'Failed to create Easter egg' });
    }

    // If image was uploaded, rename it with the actual Easter egg ID
    if (req.files && req.files.image && imageUrl) {
      try {
        const oldFileName = `temp-${Date.now()}-${req.files.image[0].originalname}`;
        const newFileName = `${data.id}-${Date.now()}-${req.files.image[0].originalname}`;
        const { error: renameError } = await supabase.storage
          .from('easter-egg-images')
          .move(oldFileName, newFileName);
        if (!renameError) {
          const { data: { publicUrl } } = supabase.storage.from('easter-egg-images').getPublicUrl(newFileName);
          await supabase.from('easter_eggs').update({ image_url: publicUrl }).eq('id', data.id);
        }
      } catch (renameError) {
        console.error('Error renaming uploaded image:', renameError);
      }
    }
    
    // If video was uploaded, rename it with the actual Easter egg ID
    if (req.files && req.files.video && videoUrl) {
      try {
        const oldFileName = `temp-${Date.now()}-${req.files.video[0].originalname}`;
        const newFileName = `${data.id}-${Date.now()}-${req.files.video[0].originalname}`;
        const { error: renameError } = await supabase.storage
          .from('easter-egg-videos')
          .move(oldFileName, newFileName);
        if (!renameError) {
          const { data: { publicUrl } } = supabase.storage.from('easter-egg-videos').getPublicUrl(newFileName);
          await supabase.from('easter_eggs').update({ video_url: publicUrl }).eq('id', data.id);
        }
      } catch (renameError) {
        console.error('Error renaming uploaded video:', renameError);
      }
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in /api/easter-eggs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT endpoint to update an existing Easter egg
app.put('/api/easter-eggs/:id', authenticateUser, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the Easter egg exists and belongs to the user
    const { data: existingEgg, error: fetchError } = await supabase
      .from('easter_eggs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingEgg) {
      return res.status(404).json({ error: 'Easter egg not found' });
    }

    if (existingEgg.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    let imageUrl = existingEgg.image_url;
    let videoUrl = existingEgg.video_url;

    // Handle image updates
    if (req.files && req.files.image) {
      // Upload new image
      imageUrl = await uploadImageToStorage(req.files.image[0], id);
    } else if (req.body.remove_image === 'true') {
      // Remove existing image
      imageUrl = null;
    }

    // Handle video updates
    if (req.files && req.files.video) {
      // Upload new video
      videoUrl = await uploadVideoToStorage(req.files.video[0], id);
    } else if (req.body.remove_video === 'true') {
      // Remove existing video
      videoUrl = null;
    }

    // Prepare update data
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      album: req.body.album || null,
      media_type: req.body.media_type || null,
      clue_type: req.body.clue_type || null,
      image_url: imageUrl,
      video_url: videoUrl,
      updated_at: new Date().toISOString()
    };

    // Update the Easter egg
    const { data: updatedEgg, error: updateError } = await supabase
      .from('easter_eggs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating Easter egg:', updateError);
      return res.status(500).json({ error: 'Failed to update Easter egg' });
    }

    res.json(updatedEgg);
  } catch (error) {
    console.error('Error in PUT /api/easter-eggs/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/easter-eggs/:id/comments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('easter_egg_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error in /api/easter-eggs/:id/comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/comments', authenticateUser, async (req, res) => {
  try {
    const commentData = {
      ...req.body,
      user_id: req.user.id,
      username: req.user.username,
      created_at: new Date().toISOString()
    }

    const { data: comment, error: commentError } = await supabase.from('comments').insert([commentData]).select().single()

    if (commentError) {
      console.error('Error adding comment:', commentError);
      return res.status(500).json({ error: 'Failed to add comment' });
    }

    // Now update the comment count on the Easter egg
    const { error: updateError } = await supabase
      .from('easter_eggs')
      .update({ 
        comments_count: supabase.rpc('increment', { row_id: req.body.easter_egg_id, x: 1 }),
        updated_at: new Date().toISOString()
      })
      .eq('id', req.body.easter_egg_id);

    if (updateError) {
      console.error('Error updating comment count:', updateError);
      // If the RPC function doesn't exist, fall back to manual count
      try {
        const { count, error: countError } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('easter_egg_id', req.body.easter_egg_id);

        if (!countError) {
          await supabase
            .from('easter_eggs')
            .update({ 
              comments_count: count,
              updated_at: new Date().toISOString()
            })
            .eq('id', req.body.easter_egg_id);
        }
      } catch (fallbackError) {
        console.error('Fallback comment count update failed:', fallbackError);
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error in /api/comments POST:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add endpoint to get comment count for an Easter egg
app.get('/api/easter-eggs/:id/comment-count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('easter_egg_id', req.params.id);

    if (error) {
      console.error('Error getting comment count:', error);
      return res.status(500).json({ error: 'Failed to get comment count' });
    }

    res.json({ count: count || 0 });
  } catch (error) {
    console.error('Error in /api/easter-eggs/:id/comment-count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add endpoint to upvote an Easter egg
app.post('/api/easter-eggs/:id/upvote', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    // Check if user already liked this Easter egg
    const { data: existingLike, error: likeCheckError } = await supabase
      .from('user_likes')
      .select('*')
      .eq('user_id', userId)
      .eq('easter_egg_id', id)
      .single()

    if (existingLike) {
      // User already liked, so unlike it
      const { error: unlikeError } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', userId)
        .eq('easter_egg_id', id)

      if (unlikeError) {
        console.error('Error removing like:', unlikeError)
        return res.status(500).json({ error: 'Failed to remove like' })
      }

      // Decrease upvote count
      const { data: currentEgg, error: fetchError } = await supabase
        .from('easter_eggs')
        .select('upvotes_count')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('Error fetching Easter egg:', fetchError)
        return res.status(500).json({ error: 'Failed to fetch Easter egg' })
      }

      const newUpvoteCount = Math.max(0, (currentEgg.upvotes_count || 0) - 1)

      const { error: updateError } = await supabase
        .from('easter_eggs')
        .update({ 
          upvotes_count: newUpvoteCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        console.error('Error updating upvote count:', updateError)
        return res.status(500).json({ error: 'Failed to update upvote count' })
      }

      res.json({ 
        success: true, 
        upvotes_count: newUpvoteCount,
        action: 'unliked',
        liked: false
      })
    } else {
      // User hasn't liked, so like it
      const { error: likeError } = await supabase
        .from('user_likes')
        .insert([{
          user_id: userId,
          easter_egg_id: id,
          created_at: new Date().toISOString()
        }])

      if (likeError) {
        console.error('Error adding like:', likeError)
        return res.status(500).json({ error: 'Failed to add like' })
      }

      // Increase upvote count
      const { data: currentEgg, error: fetchError } = await supabase
        .from('easter_eggs')
        .select('upvotes_count')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('Error fetching Easter egg:', fetchError)
        return res.status(500).json({ error: 'Failed to fetch Easter egg' })
      }

      const newUpvoteCount = (currentEgg.upvotes_count || 0) + 1

      const { error: updateError } = await supabase
        .from('easter_eggs')
        .update({ 
          upvotes_count: newUpvoteCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        console.error('Error updating upvote count:', updateError)
        return res.status(500).json({ error: 'Failed to update upvote count' })
      }

      res.json({ 
        success: true, 
        upvotes_count: newUpvoteCount,
        action: 'liked',
        liked: true
      })
    }
  } catch (error) {
    console.error('Error in /api/easter-eggs/:id/upvote:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
});

// Add endpoint to check if user has liked an Easter egg
app.get('/api/easter-eggs/:id/like-status', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    const { data: existingLike, error: likeCheckError } = await supabase
      .from('user_likes')
      .select('*')
      .eq('user_id', userId)
      .eq('easter_egg_id', id)
      .single()

    res.json({ 
      liked: !!existingLike,
      upvotes_count: 0 // This will be updated by the frontend
    })
  } catch (error) {
    console.error('Error in /api/easter-eggs/:id/like-status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
});

// Add endpoint to get upvote count for an Easter egg
app.get('/api/easter-eggs/:id/upvote-count', async (req, res) => {
  try {
    const { id } = req.params
    
    const { data, error } = await supabase
      .from('easter_eggs')
      .select('upvotes_count')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error getting upvote count:', error)
      return res.status(500).json({ error: 'Failed to get upvote count' })
    }

    res.json({ upvotes_count: data?.upvotes_count || 0 })
  } catch (error) {
    console.error('Error in /api/easter-eggs/:id/upvote-count:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
});

// Test endpoint to check database connection
app.get('/api/test', async (req, res) => {
  try {
    // Test if we can connect to Supabase
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('Database test error:', error)
      return res.status(500).json({ 
        error: 'Database connection failed', 
        details: error.message,
        hint: 'Make sure to run the QUICK_FIX.sql script in your Supabase dashboard'
      })
    }
    
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      usersTableExists: true
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    res.status(500).json({ 
      error: 'Test failed', 
      details: error.message 
    })
  }
})

// Add endpoint to register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    if (username.trim() === '') {
      return res.status(400).json({ error: 'Username cannot be empty' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }

    // Check if username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' })
    }

    // Create user profile in our users table with a simple hash
    const bcrypt = require('bcrypt')
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert([{
        username: username,
        password_hash: hashedPassword,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return res.status(500).json({ error: 'Failed to create user profile' })
    }

    // Create a simple session token
    const sessionToken = Buffer.from(`${userProfile.id}:${Date.now()}`).toString('base64')

    res.status(201).json({ 
      success: true, 
      user: { id: userProfile.id, username: userProfile.username },
      sessionToken: sessionToken,
      message: 'User registered successfully' 
    })
  } catch (error) {
    console.error('Error in /api/auth/register:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Add endpoint to login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Get user profile with password hash
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (profileError || !userProfile) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    // Verify password
    const bcrypt = require('bcrypt')
    const isValidPassword = await bcrypt.compare(password, userProfile.password_hash)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    // Create session token
    const sessionToken = Buffer.from(`${userProfile.id}:${Date.now()}`).toString('base64')

    res.json({ 
      success: true, 
      user: { id: userProfile.id, username: userProfile.username },
      sessionToken: sessionToken,
      message: 'Login successful' 
    })
  } catch (error) {
    console.error('Error in /api/auth/login:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
 })

// Add endpoint to logout user
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { sessionToken } = req.body

    if (!sessionToken) {
      return res.status(400).json({ error: 'Session token required' })
    }

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
    }

    res.json({ success: true, message: 'Logout successful' })
  } catch (error) {
    console.error('Error in /api/auth/logout:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Add endpoint to get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    
    // Decode the simple token
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [userId, timestamp] = decoded.split(':')
      
      // Check if token is not too old (24 hours)
      const tokenAge = Date.now() - parseInt(timestamp)
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return res.status(401).json({ error: 'Token expired' })
      }

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError || !userProfile) {
        return res.status(404).json({ error: 'User profile not found' })
      }

      res.json({ 
        success: true, 
        user: { 
          id: userProfile.id, 
          username: userProfile.username
        }
      })
    } catch (decodeError) {
      return res.status(401).json({ error: 'Invalid token format' })
    }
  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Profile updates disabled - users cannot change their profile
app.put('/api/users/profile', authenticateUser, (req, res) => {
  res.status(403).json({ error: 'Profile updates are not allowed' });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔧 Supabase Config:`);
  console.log(`URL: ${supabaseUrl ? "✅ Set" : "❌ Missing"}`);
  console.log(`Key: ${supabaseAnonKey ? "✅ Set" : "❌ Missing"}`);
}); 