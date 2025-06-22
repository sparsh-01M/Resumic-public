// import express from 'express';
// import { uploadResume, saveParsedResume, saveTemplate, getResumeHistory, deleteResume, downloadResume, updateTransformedResumeUrls } from '../controllers/resume.js';
// import { upload } from '../services/cloudinary.js';
// import { auth } from '../middleware/auth.js';

// const router = express.Router();

// // Upload resume (protected route)
// router.post('/upload', auth, upload.single('resume'), uploadResume);

// // Get resume history (protected route)
// router.get('/history', auth, getResumeHistory);

// // Delete resume (protected route)
// router.delete('/:resumeId', auth, deleteResume);

// // Download resume (protected route)
// router.get('/:resumeId/download', auth, downloadResume);

// // Save parsed resume data (protected route)
// router.post('/save-parsed', auth, saveParsedResume);

// // Save template selection and transformed data
// router.post('/template', auth, saveTemplate);

// // Update transformed resume URLs
// router.put('/update-urls', auth, updateTransformedResumeUrls);

// export default router; 