import * as authService from '../services/authService.js';
import cookieParser from 'cookie-parser';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    return res
      .status(200)
      .cookie('accessToken', result.accessToken, cookieOptions)
      .cookie('refreshToken', result.refreshToken, cookieOptions)
      .json({
        success: true,
        message: 'User logged in successfully',
        data: result,
      });
  } catch (err) {
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const tokens = await authService.refreshAccessToken(incomingRefreshToken);

    return res
      .status(200)
      .cookie('accessToken', tokens.accessToken, cookieOptions)
      .cookie('refreshToken', tokens.refreshToken, cookieOptions)
      .json({
        success: true,
        message: 'Access token refreshed successfully',
        data: tokens,
      });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};
