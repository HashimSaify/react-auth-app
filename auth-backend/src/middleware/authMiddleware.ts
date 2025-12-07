// src/middleware/authMiddleware.ts
// Simple stub so any import '../middleware/authMiddleware' works,
// and Express always receives a valid function.

import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

// Very simple middleware: just logs and continues.
// (We are not actually using this in authRoutes now, but it's safe.)
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log('Stub authMiddleware from middleware/authMiddleware.ts');
  next();
};

// Default export as well, in case something uses `import authMiddleware from ...`
export default authMiddleware;
