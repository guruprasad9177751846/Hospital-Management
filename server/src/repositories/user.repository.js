const { User } = require('../models');

class UserRepository {
  async create(data) {
    const user = new User(data);
    return await user.save();
  }

  async findAll(params = {}) {
    const { search, role, hospitalId, page = 1, limit = 50 } = params;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }
    // Hospital filter (optional for backward compatibility)
    if (hospitalId) {
      query.hospital = hospitalId;
    }

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('hospital', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id) {
    return await User.findById(id)
      .select('-password')
      .populate('hospital', 'name code logoUrl');
  }

  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  async update(id, data) {
    // If password is provided, it will be hashed by the pre-save hook
    if (data.password) {
      const user = await User.findById(id);
      if (user) {
        user.password = data.password;
        delete data.password;
        Object.assign(user, data);
        await user.save();
        return await this.findById(id);
      }
    }
    
    await User.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    return await this.findById(id);
  }

  async updateProfile(id, data) {
    // Only allow updating specific profile fields
    const allowedFields = ['name', 'email', 'profilePicture'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    return await User.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password').populate('hospital', 'name code logoUrl');
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }
}

module.exports = new UserRepository();
