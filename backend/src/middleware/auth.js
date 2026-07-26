import jwt from 'jsonwebtoken';

import User from
  '../models/User.js';

import {
  AppError,
} from '../utils/AppError.js';

export const protect = async (
  req,
  res,
  next
) => {
  try {
    let token = null;

    const authorization =
      req.headers.authorization;

    if (
      authorization?.startsWith(
        'Bearer '
      )
    ) {
      token =
        authorization.split(' ')[1];
    }

    if (!token) {
      token =
        req.cookies?.accessToken;
    }

    if (!token) {
      throw new AppError(
        'Authentication required',
        401
      );
    }

    const decoded = jwt.verify(
      token,
      process.env
        .ACCESS_TOKEN_SECRET
    );

    const user =
      await User.findById(
        decoded.id
      ).select(
        '-password -refreshToken'
      );

    if (!user) {
      throw new AppError(
        'User no longer exists',
        401
      );
    }

    if (!user.status) {
      throw new AppError(
        'User account is inactive',
        403
      );
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    if (
      error.name ===
      'TokenExpiredError'
    ) {
      return next(
        new AppError(
          'Access token expired',
          401
        )
      );
    }

    return next(
      new AppError(
        'Invalid access token',
        401
      )
    );
  }
};

export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (
      !req.user ||
      !allowedRoles.includes(
        req.user.role
      )
    ) {
      return next(
        new AppError(
          'You are not authorized to perform this action',
          403
        )
      );
    }

    next();
  };