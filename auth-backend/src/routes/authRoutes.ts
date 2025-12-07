// src/routes/authRoutes.ts

import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * Extend Express Request to allow storing user data after verifying JWT
 */
interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * -------------------------------------------------------
 * 🔐 AUTH MIDDLEWARE
 * -------------------------------------------------------
 * Reads `Authorization: Bearer <token>` header,
 * verifies token,
 * and attaches user ID + email to request.
 */
const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Missing Authorization header.' });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid Authorization format.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret missing in .env' });
    }

    // Decode JWT
    const decoded: any = jwt.verify(token, secret);

    console.log('🔍 Decoded Token:', decoded);

    // Handle different field names (id / _id / userId)
    req.userId = decoded.id || decoded._id || decoded.userId;
    req.userEmail = decoded.email || decoded.userEmail;

    if (!req.userId) {
      return res.status(401).json({ message: 'Invalid token: no user ID.' });
    }

    next();
  } catch (err) {
    console.error('❌ Token validation failed:', err);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};



/**
 * -------------------------------------------------------
 * 🟢 SIGNUP ROUTE (with strong password validation)
 * -------------------------------------------------------
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1) Basic required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // 2) Confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // 3) Strong password check
    // At least:
    // - 8 characters
    // - 1 uppercase
    // - 1 lowercase
    // - 1 number
    // - 1 symbol (@$!%*?&)
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.',
      });
    }

    // 4) Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    // 5) Create user (password will be hashed in User model pre-save hook)
    const newUser = await User.create({ name, email, password });

    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err) {
    console.error('Error in /signup:', err);
    return res.status(500).json({ message: 'Signup error.' });
  }
});




/**
 * -------------------------------------------------------
 * 🟡 LOGIN ROUTE
 * -------------------------------------------------------
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid login credentials.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid login credentials.' });

    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign(
      { id: user._id, email: user.email },
      secret,
      { expiresIn: '1d' } // 1 day remember-me token
    );

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login error.' });
  }
});



/**
 * -------------------------------------------------------
 * 🟣 PROFILE ROUTE (PRIVATE)
 * -------------------------------------------------------
 */
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });

    return res.json({
      message: 'Profile loaded.',
      user,
    });
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ message: 'Could not fetch profile.' });
  }
});

/**
 * -------------------------------------------------------
 * 🔵 UPDATE PROFILE (name + email)
 * -------------------------------------------------------
 * PUT /api/auth/profile
 */
router.put(
  '/profile',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        return res
          .status(400)
          .json({ message: 'Name and email are required.' });
      }

      // Find current user
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Check if email is used by someone else
      const existingWithEmail = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (existingWithEmail) {
        return res
          .status(400)
          .json({ message: 'That email is already used by another account.' });
      }

      user.name = name;
      user.email = email;
      await user.save();

      return res.status(200).json({
        message: 'Profile updated successfully.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      return res
        .status(500)
        .json({ message: 'Something went wrong updating profile.' });
    }
  }
);

/**
 * -------------------------------------------------------
 * 🔴 CHANGE PASSWORD
 * -------------------------------------------------------
 * PUT /api/auth/change-password
 */
router.put(
  '/change-password',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { oldPassword, newPassword, confirmNewPassword } = req.body;

      if (!oldPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({
          message: 'Old password, new password and confirm password are required.',
        });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: 'New password must be at least 6 characters.' });
      }

      if (newPassword !== confirmNewPassword) {
        return res
          .status(400)
          .json({ message: 'New passwords do not match.' });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const isOldCorrect = await user.comparePassword(oldPassword);
      if (!isOldCorrect) {
        return res
          .status(400)
          .json({ message: 'Old password is incorrect.' });
      }

      // Setting password triggers pre-save hook (hash)
      user.password = newPassword;
      await user.save();

      return res
        .status(200)
        .json({ message: 'Password changed successfully.' });
    } catch (err) {
      console.error('Error changing password:', err);
      return res
        .status(500)
        .json({ message: 'Something went wrong changing password.' });
    }
  }
);


export default router;
