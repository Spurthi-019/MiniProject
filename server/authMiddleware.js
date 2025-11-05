const jwt = require('jsonwebtoken');
const User = require('./models/User');

/**
 * Middleware to verify JWT and attach user data to request
 * Expects Authorization header: "Bearer <token>"
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'change_this_to_a_strong_secret';
    const decoded = jwt.verify(token, jwtSecret);

    // Attach user data to request (id and role from token payload)
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    // Optionally fetch full user from database (uncomment if needed)
    // const user = await User.findById(decoded.id).select('-password');
    // if (!user) {
    //   return res.status(401).json({ message: 'User not found' });
    // }
    // req.user = user;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

/**
 * Middleware to check if user has a specific role
 * Usage: authorize(['Admin/Team Lead', 'Mentor'])
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: user not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: requires one of roles [${allowedRoles.join(', ')}]` 
      });
    }

    next();
  };
};

module.exports = { authMiddleware, authorize };
