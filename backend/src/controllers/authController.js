import * as authService from
  '../services/authService.js';

import User from
  '../models/User.js';

const cookieOptions = {
  httpOnly: true,

  secure:
    process.env.NODE_ENV ===
    'production',

  sameSite:
    process.env.NODE_ENV ===
      'production'
      ? 'none'
      : 'lax',

  maxAge:
    7 * 24 * 60 * 60 * 1000,
};

const clearCookieOptions = {
  httpOnly: true,

  secure:
    process.env.NODE_ENV ===
    'production',

  sameSite:
    process.env.NODE_ENV ===
      'production'
      ? 'none'
      : 'lax',
};

export const login = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const result =
      await authService.loginUser(
        email,
        password
      );

    return res
      .status(200)
      .cookie(
        'accessToken',
        result.accessToken,
        cookieOptions
      )
      .cookie(
        'refreshToken',
        result.refreshToken,
        cookieOptions
      )
      .json({
        success: true,

        message:
          'User logged in successfully',

        data: {
          user: result.user,

          accessToken:
            result.accessToken,
        },
      });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await authService.registerUser(
        req.body
      );

    return res.status(201).json({
      success: true,

      message:
        'User registered successfully',

      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req,
  res,
  next
) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken ||
      req.body?.refreshToken;

    const tokens =
      await authService
        .refreshAccessToken(
          incomingRefreshToken
        );

    return res
      .status(200)
      .cookie(
        'accessToken',
        tokens.accessToken,
        cookieOptions
      )
      .cookie(
        'refreshToken',
        tokens.refreshToken,
        cookieOptions
      )
      .json({
        success: true,

        message:
          'Access token refreshed successfully',

        data: {
          accessToken:
            tokens.accessToken,
        },
      });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req,
  res
) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

export const logout = async (
  req,
  res,
  next
) => {
  try {
    if (req.user?._id) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            refreshToken: null,
          },
        }
      );
    }

    return res
      .status(200)
      .clearCookie(
        'accessToken',
        clearCookieOptions
      )
      .clearCookie(
        'refreshToken',
        clearCookieOptions
      )
      .json({
        success: true,

        message:
          'User logged out successfully',
      });
  } catch (error) {
    next(error);
  }
};