import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Access denied. Invalid token format.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token has expired. Please login again.',
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: 'Invalid token. Please login again.',
        });
      }
      throw error;
    }

    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      message: 'Authentication failed. Please try again.',
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
      } catch (error) {
        console.log(
          'Optional authentication: Invalid token, continuing without auth'
        );
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error: ', error);
    next();
  }
};

export const requireVerified = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        message: 'Please verify your email to access this resource.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Verification check error: ', error);
    res.status(500).json({
      message: 'Verification check failed.',
    });
  }
};

export const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
