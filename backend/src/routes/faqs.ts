import express from 'express';
import FAQ from '../models/FAQ.js';

const router = express.Router();

// Test route to check if FAQs routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'FAQs routes are working!' });
});

// Get all FAQs
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 50, page = 1 } = req.query;
    
    let query: any = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const faqs = await FAQ.find(query)
      .sort({ order: 1, category: 1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await FAQ.countDocuments(query);
    
    res.json({
      faqs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
  }
});

// Get FAQ categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await FAQ.distinct('category');
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Mark FAQ as helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const { id } = req.params;
    
    const faq = await FAQ.findById(id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    faq.helpful += 1;
    await faq.save();
    
    res.json({ message: 'Thank you for your feedback!' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating FAQ', error: error.message });
  }
});

// Mark FAQ as not helpful
router.post('/:id/not-helpful', async (req, res) => {
  try {
    const { id } = req.params;
    
    const faq = await FAQ.findById(id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    faq.notHelpful += 1;
    await faq.save();
    
    res.json({ message: 'Thank you for your feedback!' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating FAQ', error: error.message });
  }
});

export default router; 