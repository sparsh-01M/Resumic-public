import express from 'express';
import BlogPost from '../models/BlogPost.js';

const router = express.Router();

// Test route to check if blog routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Blog routes are working!' });
});

// Get all blog posts
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, limit = 10, page = 1 } = req.query;
    
    let query: any = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const posts = await BlogPost.find(query)
      .sort({ date: -1, featured: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-content'); // Exclude full content for list view
    
    const total = await BlogPost.countDocuments(query);
    
    res.json({
      posts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching blog posts', error: error.message });
  }
});

// Get featured blog post
router.get('/featured', async (req, res) => {
  try {
    const featuredPost = await BlogPost.findOne({ featured: true })
      .sort({ date: -1 });
    
    res.json(featuredPost);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching featured post', error: error.message });
  }
});

// Get blog post by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const post = await BlogPost.findOne({ slug });
    
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Increment views
    post.views += 1;
    await post.save();
    
    res.json(post);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching blog post', error: error.message });
  }
});

// Get blog categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await BlogPost.distinct('category');
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

export default router; 