import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

// Very simple middleware: just logs and continues.
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log('Stub authMiddleware from middleware/authMiddleware.ts');
  next();
};

export default authMiddleware;
