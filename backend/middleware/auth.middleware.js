import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * JWT Authentication Guard Middleware
 * 
 * Verifies Bearer JWT tokens in Authorization header, checks user state in DB,
 * and attaches sanitized user context to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, authentication token missing',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mdsaips_default_jwt_secret_key');

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is currently ${user.status}. Access denied.`,
      });
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
    };

    next();
  } catch (error) {
    logger.warn(`JWT verification failure: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid or expired token',
    });
  }
};

export default protect;
