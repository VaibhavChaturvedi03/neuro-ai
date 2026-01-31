import express from 'express';
import {
  getWordForLetter,
  getUserTestProgress,
  saveTestAttempt,
  resetTest,
  getAllUserTests,
  getUserStatistics,
  recordAndAnalyze,
  getCourseRecommendations
} from '../controllers/testController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/word/:letter', getWordForLetter);
router.get('/record', recordAndAnalyze);

// Protected routes (require authentication)
router.get('/progress/:letter', protect, getUserTestProgress);
router.post('/attempt', protect, saveTestAttempt);
router.delete('/reset/:letter', protect, resetTest);
router.get('/all', protect, getAllUserTests);
router.get('/statistics', protect, getUserStatistics);
router.get('/recommendations', protect, getCourseRecommendations);

export default router;
