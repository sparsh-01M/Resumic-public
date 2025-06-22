import express from 'express';
import Guide from '../models/Guide.js';

const router = express.Router();

// Test route to check if guides routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Guides routes are working!' });
});

// Get all guides
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, featured, limit = 10, page = 1 } = req.query;
    
    let query: any = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const guides = await Guide.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-content'); // Exclude full content for list view
    
    const total = await Guide.countDocuments(query);
    
    res.json({
      guides,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching guides', error: error.message });
  }
});

// Get featured guide
router.get('/featured', async (req, res) => {
  try {
    const featuredGuide = await Guide.findOne({ featured: true })
      .sort({ createdAt: -1 });
    
    res.json(featuredGuide);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching featured guide', error: error.message });
  }
});

// Get guide by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const guide = await Guide.findOne({ slug });
    
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    // Increment downloads
    guide.downloads += 1;
    await guide.save();
    
    res.json(guide);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching guide', error: error.message });
  }
});

// Get guide categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Guide.distinct('category');
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Get guide difficulties
router.get('/difficulties/list', async (req, res) => {
  try {
    const difficulties = await Guide.distinct('difficulty');
    res.json(difficulties);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching difficulties', error: error.message });
  }
});

export default router; 