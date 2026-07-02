/**
 * Authentication Middleware
 * 
 * Provides JWT-based authentication for protected routes.
 * 
 * TODO: Implement actual authentication when user system is ready
 * - JWT token verification
 * - User extraction from token
 * - Role-based access control
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, AuthorizationError } from '../types/errors';

/**
 * Extend Express Request to include user information
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        customerId?: string;
        email?: string;
        role?: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and extracts user information
 * 
 * TODO: Implement actual JWT verification when authentication system is ready
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authentication token required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // TODO: Verify JWT token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    // req.user = decoded;

    // Placeholder: For now, we'll skip authentication in mock mode
    // When real authentication is implemented, uncomment the above and remove this
    console.warn('Authentication middleware: Placeholder implementation - TODO: Implement JWT verification');
    
    // For mock mode, we'll allow requests without authentication
    // In production, this should be removed
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    }
    next(new AuthenticationError('Invalid or expired authentication token'));
  }
};

/**
 * Optional authentication middleware
 * Attaches user information if token is present, but doesn't require it
 */
export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // TODO: Verify JWT token if present
      // const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      // req.user = decoded;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user info
    next();
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role
 * 
 * @param roles - Array of allowed roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      if (!req.user.role) {
        throw new AuthorizationError('User role not defined');
      }

      if (!roles.includes(req.user.role)) {
        throw new AuthorizationError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
