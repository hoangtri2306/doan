const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Attach user to request
    req.user = {
      id: decoded.userId,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    // Handle expired token specifically if needed, otherwise general 401
    const message = error.name === 'TokenExpiredError' 
      ? 'Access token expired' 
      : 'Invalid token';
      
    res.status(401).json({
      success: false,
      data: null,
      message
    });
  }
};

const optionalAuthenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    // Even if token is invalid, we treat them as guest instead of throwing 401
    next();
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    if (!req.user || !rolesArray.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Forbidden: Insufficient permissions'
      });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  authenticate: authMiddleware,
  optionalAuthenticate,
  authorize
};
