import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';
import { VolunteerController } from '../controllers/VolunteerController';
import { volunteerLimiter } from '../middleware/rateLimit';

export function createVolunteerRoutes(volunteerController: VolunteerController): Router {
  const router = Router();

  const volunteerValidation = [
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
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .isLength({ min: 7, max: 20 })
      .withMessage('Phone number must be between 7 and 20 characters')
      .escape(),
    body('message')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Message must not exceed 2000 characters')
      .custom((value) => {
        if (!value) return true;
        return xss(value) === value;
      }),
  ];

  router.post(
    '/volunteer',
    volunteerLimiter,
    volunteerValidation,
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      req.body = {
        name: xss(req.body.name),
        email: xss(req.body.email),
        phone: xss(req.body.phone),
        message: req.body.message ? xss(req.body.message) : '',
      };

      volunteerController.submitVolunteer(req, res, next);
    }
  );

  return router;
}
