import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from 'express-validator';
import xss from 'xss';
import { ContactController } from '../controllers/ContactController';

export function createContactRoutes(contactController: ContactController): Router {
  const router = Router();

  const contactValidation = [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .escape(),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Subject must be between 3 and 200 characters')
      .escape(),
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ min: 10, max: 2000 })
      .withMessage('Message must be between 10 and 2000 characters')
      .custom((value) => {
        // Sanitize message to prevent XSS
        return xss(value) === value;
      }),
  ];

  router.post(
  "/contact",
  contactValidation,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    // Additional XSS sanitization
    req.body = {
      name: xss(req.body.name),
      email: xss(req.body.email),
      subject: xss(req.body.subject),
      message: xss(req.body.message),
    };

    contactController.submitContact(req, res, next);
  }
);

  return router;
}
