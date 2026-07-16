import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const token = tokenFromHeader || req.cookies?.accessToken;

  if (!token) {
    return next(new AppError('Not authorized, no token', 401));
  }

  try {
    const decoded = jwt.verify(token, accessTokenSecret);
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user || !user.status) {
      return next(new AppError('User not found or inactive', 401));
    }

    req.user = user;
    next();
  } catch {
    next(new AppError('Not authorized, token invalid', 401));
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Not authorized for this action', 403));
  }
  next();
};
