const jwt = require('jsonwebtoken');
const { User, Hospital } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const config = require('../config');

class AuthService {
  async register(userData) {
    const { email, password, name, role = 'staff', hospital: hospitalId } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Get hospital - use provided or default
    let hospital;
    if (hospitalId) {
      hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
        throw new AppError('Hospital not found', 400);
      }
    } else {
      hospital = await Hospital.getDefault();
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role,
      hospital: hospital._id
    });

    // Generate token
    const token = this.generateToken(user._id, user.role);

    return {
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        hospital: {
          _id: hospital._id,
          name: hospital.name,
          code: hospital.code,
          logoUrl: hospital.logoUrl
        }
      }
    };
  }

  async login(email, password) {
    // Find user with password field and populate hospital
    const user = await User.findOne({ email })
      .select('+password')
      .populate('hospital', 'name code logoUrl');
    
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Please contact administrator.', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = this.generateToken(user._id, user.role);

    // Get hospital info (use default if not assigned)
    let hospitalInfo = user.hospital;
    if (!hospitalInfo) {
      const defaultHospital = await Hospital.getDefault();
      hospitalInfo = {
        _id: defaultHospital._id,
        name: defaultHospital.name,
        code: defaultHospital.code,
        logoUrl: defaultHospital.logoUrl
      };
    }

    return {
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture,
        hospital: hospitalInfo
      }
    };
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId)
      .populate('hospital', 'name code logoUrl');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  generateToken(userId, role) {
    return jwt.sign(
      { id: userId, role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }
}

module.exports = new AuthService();
