import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (process.env.NODE_ENV === 'development') {
    console.log('[authService] login attempt for:', email);
    console.log('[authService] user found:', !!user);
  }
  if (!user || !(await user.comparePassword(password))) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[authService] invalid credentials for:', email);
    }
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.status) {
    throw new AppError('Account is inactive', 403);
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return { user, token };
};

export const registerUser = async (data) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new AppError('Email already registered', 400);
  return User.create(data);
};
