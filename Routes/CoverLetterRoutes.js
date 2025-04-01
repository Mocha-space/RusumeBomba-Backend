import express from 'express';
import { 
  saveCoverLetter,
  downloadCoverLetter,
  getCoverLetters,
  deleteCoverLetter,
} from '../Controllers/CoverLetterController.js';
import { authMiddleware } from '../Middleware/AuthMiddleware.js';

const router = express.Router();

// Protected routes
router.post('/save', authMiddleware, saveCoverLetter);
router.get('/download/:letterId', authMiddleware, downloadCoverLetter);

router.get('/', authMiddleware, getCoverLetters);

router.delete('/:id', authMiddleware, deleteCoverLetter);



export default router;