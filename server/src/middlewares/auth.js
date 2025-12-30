const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('./errorHandler');
const config = require('../config');

// Verify JWT token and attach user to request
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Find user and populate hospital
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('hospital', 'name code logoUrl isDefault');
    
    if (!user) {
      return next(new AppError('User not found.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('User account is deactivated.', 401));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired.', 401));
    }
    next(error);
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied. Insufficient permissions.', 403));
    }

    next();
  };
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  next();
};

module.exports = { authenticate, authorize, adminOnly };

