import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select('+password');

  if (process.env.NODE_ENV === 'development') {
    console.log('[authService] login attempt for:', normalizedEmail);
    console.log('[authService] user found:', Boolean(user));
    console.log(
      '[authService] password available:',
      Boolean(user?.password)
    );
    console.log('[authService] user status:', user?.status);
    console.log(
      '[authService] JWT secret exists:',
      Boolean(process.env.JWT_SECRET)
    );
  }

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.status === false) {
    throw new AppError('Account is inactive', 403);
  }

  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT configuration is missing', 500);
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  return {
    user: safeUser,
    token,
  };
};

export const registerUser = async (data) => {
  const normalizedEmail = data.email.trim().toLowerCase();

  const exists = await User.findOne({
    email: normalizedEmail,
  });

  if (exists) {
    throw new AppError('Email already registered', 400);
  }

  return User.create({
    ...data,
    email: normalizedEmail,
  });
};