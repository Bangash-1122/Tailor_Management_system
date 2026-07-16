import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';


const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Access and refresh tokens generation failed', 500);
  }
};

export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.status) {
    throw new AppError('Your account is inactive', 403);
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

  return {
    user: loggedInUser,
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new AppError('Unauthorized request', 401);
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.status) {
      throw new AppError('User account is inactive', 403);
    }

    if (user.refreshToken !== incomingRefreshToken) {
      throw new AppError('Refresh token is expired or used', 401);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error?.message || 'Invalid refresh token', 401);
  }
};


export const registerUser = async (data) => {
  const { name, email, password, role, phone } = data || {};

  if (!name?.trim() || !email?.trim() || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const allowedRoles = ['admin', 'manager', 'tailor', 'receptionist', 'customer'];
  const normalizedRole = role?.trim() || 'receptionist';
  const safeRole = allowedRoles.includes(normalizedRole) ? normalizedRole : 'receptionist';

  const createdUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: safeRole,
    phone: phone?.trim(),
  });

  return User.findById(createdUser._id).select('-password -refreshToken');
};