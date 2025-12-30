const { Hospital } = require('../models');
const { AppError } = require('./errorHandler');

/**
 * Middleware to inject hospital context into requests.
 * This middleware resolves the hospital ID from:
 * 1. Query parameter (hospitalId) - for admins accessing other hospitals
 * 2. User's assigned hospital
 * 3. Default hospital (fallback for backward compatibility)
 * 
 * The resolved hospital ID is attached to req.hospitalId
 */
const injectHospitalContext = async (req, res, next) => {
  try {
    let hospitalId = null;

    // Priority 1: Explicit hospitalId in query (admin override)
    if (req.query.hospitalId) {
      // Only admins can access other hospitals
      if (req.user && req.user.role === 'admin') {
        hospitalId = req.query.hospitalId;
      } else if (req.user) {
        // Non-admin trying to access different hospital
        if (req.user.hospital && req.query.hospitalId !== req.user.hospital.toString()) {
          return next(new AppError('Access denied. You can only access your assigned hospital.', 403));
        }
        hospitalId = req.query.hospitalId;
      }
    }

    // Priority 2: User's assigned hospital
    if (!hospitalId && req.user && req.user.hospital) {
      hospitalId = req.user.hospital;
    }

    // Priority 3: Default hospital (backward compatibility)
    if (!hospitalId) {
      const defaultHospital = await Hospital.getDefault();
      hospitalId = defaultHospital._id;
    }

    // Attach to request
    req.hospitalId = hospitalId;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to validate that user has access to the requested hospital.
 * Used for routes where hospital access must be strictly enforced.
 */
const validateHospitalAccess = async (req, res, next) => {
  try {
    // Admins have access to all hospitals
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    // For non-admins, verify they belong to the requested hospital
    const requestedHospitalId = req.hospitalId || req.query.hospitalId || req.body.hospitalId;
    
    if (!requestedHospitalId) {
      return next(); // No specific hospital requested, will use user's hospital
    }

    if (req.user && req.user.hospital) {
      if (requestedHospitalId.toString() !== req.user.hospital.toString()) {
        return next(new AppError('Access denied. Cross-hospital data access is not allowed.', 403));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get hospital filter for queries.
 * Returns the appropriate filter based on user's hospital access.
 * 
 * @param {Object} user - The authenticated user
 * @param {String} requestedHospitalId - Optional hospital ID from request
 * @returns {Object} MongoDB filter for hospital
 */
const getHospitalFilter = async (user, requestedHospitalId = null) => {
  // Admin can filter by any hospital or see all
  if (user && user.role === 'admin') {
    if (requestedHospitalId) {
      return { hospital: requestedHospitalId };
    }
    // Admin without filter sees all hospitals - return empty filter
    // But for backward compatibility, we might want to filter by their hospital
    if (user.hospital) {
      return { hospital: user.hospital };
    }
    // Return all if admin has no hospital assigned
    return {};
  }

  // Non-admin: strictly their hospital
  if (user && user.hospital) {
    return { hospital: user.hospital };
  }

  // Fallback: default hospital (backward compatibility)
  const defaultHospital = await Hospital.getDefault();
  return { hospital: defaultHospital._id };
};

/**
 * Helper function to get hospital ID for new records.
 * 
 * @param {Object} user - The authenticated user
 * @param {String} requestedHospitalId - Optional hospital ID from request
 * @returns {ObjectId} Hospital ID to use for new records
 */
const getHospitalIdForCreate = async (user, requestedHospitalId = null) => {
  // Admin can create in any hospital if specified
  if (user && user.role === 'admin' && requestedHospitalId) {
    return requestedHospitalId;
  }

  // Use user's hospital if assigned
  if (user && user.hospital) {
    return user.hospital;
  }

  // Fallback: default hospital
  const defaultHospital = await Hospital.getDefault();
  return defaultHospital._id;
};

module.exports = {
  injectHospitalContext,
  validateHospitalAccess,
  getHospitalFilter,
  getHospitalIdForCreate
};

