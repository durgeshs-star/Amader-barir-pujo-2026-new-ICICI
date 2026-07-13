import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { QuestionairController } from '../controllers/QuestionairController';

export function createQuestionairRoutes(questionairController: QuestionairController): Router {
  const router = Router();

  const validation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('workingAt').trim().notEmpty().withMessage('Working at is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('contactNo').trim().matches(/^\d{10,15}$/).withMessage('Valid phone number is required'),
    body('pujaMember').trim().isIn(['yes', 'no']).withMessage('Please select yes or no'),
    body('committee').trim().notEmpty().withMessage('Committee selection is required'),
    body('willingVolunteer').trim().isIn(['yes', 'no']).withMessage('Please select yes or no'),
  ];

  router.post('/questionair/submit', validation, (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    questionairController.submit(req, res, next);
  });

  return router;
}
