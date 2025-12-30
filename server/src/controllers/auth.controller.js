const { authService, userService } = require('../services');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user._id);
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(
        req.user._id,
        currentPassword,
        newPassword
      );
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { name, email, profilePicture } = req.body;
      const user = await userService.updateProfile(req.user._id, {
        name,
        email,
        profilePicture
      });
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

