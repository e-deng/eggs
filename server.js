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
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
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

app.post('/api/easter-eggs', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;
    
    // If an image was uploaded, save it to Supabase Storage
    if (req.file) {
      try {
        imageUrl = await uploadImageToStorage(req.file, 'temp');
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    }

    // Prepare the Easter egg data
    const easterEggData = {
      ...req.body,
      image_url: imageUrl || req.body.image_url, // Use uploaded image or fallback to URL
      upvotes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert the Easter egg
    const { data, error } = await supabase
      .from('easter_eggs')
      .insert([easterEggData])
      .select()
      .single();

    if (error) {
      console.error('Error adding Easter egg:', error);
      return res.status(500).json({ error: 'Failed to add Easter egg' });
    }

    // If image was uploaded, update the filename with the actual Easter egg ID
    if (req.file && imageUrl) {
      try {
        const newFileName = `${data.id}-${Date.now()}-${req.file.originalname}`;
        const { error: renameError } = await supabase.storage
          .from('easter-egg-images')
          .move(`temp-${Date.now()}-${req.file.originalname}`, newFileName);

        if (!renameError) {
          // Update the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('easter-egg-images')
            .getPublicUrl(newFileName);

          // Update the Easter egg with the new image URL
          await supabase
            .from('easter_eggs')
            .update({ image_url: publicUrl })
            .eq('id', data.id);
        }
      } catch (renameError) {
        console.error('Error renaming uploaded image:', renameError);
      }
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in /api/easter-eggs POST:', error);
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

app.post('/api/comments', async (req, res) => {
  try {
    // First, insert the comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert([req.body])
      .select()
      .single();

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
app.post('/api/easter-eggs/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params
    const { action } = req.body // 'upvote' or 'downvote'
    
    // Get current upvote count
    const { data: currentEgg, error: fetchError } = await supabase
      .from('easter_eggs')
      .select('upvotes_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching Easter egg:', fetchError)
      return res.status(500).json({ error: 'Failed to fetch Easter egg' })
    }

    if (!currentEgg) {
      return res.status(404).json({ error: 'Easter egg not found' })
    }

    // Calculate new upvote count
    let newUpvoteCount = currentEgg.upvotes_count || 0
    if (action === 'upvote') {
      newUpvoteCount += 1
    } else if (action === 'downvote') {
      newUpvoteCount = Math.max(0, newUpvoteCount - 1)
    }

    // Update the upvote count
    const { data: updatedEgg, error: updateError } = await supabase
      .from('easter_eggs')
      .update({ 
        upvotes_count: newUpvoteCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating upvote count:', updateError)
      return res.status(500).json({ error: 'Failed to update upvote count' })
    }

    res.json({ 
      success: true, 
      upvotes_count: newUpvoteCount,
      action: action 
    })
  } catch (error) {
    console.error('Error in /api/easter-eggs/:id/upvote:', error)
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