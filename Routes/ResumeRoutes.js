import express from 'express';
import { 
  saveResume, 
  getTemplates, 
  downloadResume,
  getResumes,
  deleteResume
} from '../Controllers/ResumeController.js';
import { authMiddleware } from '../Middleware/AuthMiddleware.js';


const router = express.Router();

// Public route - get available templates
router.get('/templates', getTemplates);

// Protected routes (require authentication)
router.post('/save', authMiddleware, saveResume);
router.get('/download/:resumeId', authMiddleware, downloadResume);

//Fetching resume
router.get('/', authMiddleware, getResumes);

router.delete('/:id', authMiddleware, deleteResume);


export default router;