import jwt from 'jsonwebtoken';
import createError from './errors.js';

const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return next(createError(401, 'You are not authenticated'));

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return next(createError(403, 'Token is invalid'));
    req.user = user;
    next();
  });
};

const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return next(createError(403, 'Not authorized'));
    }
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return next(createError(403, 'Not authorized'));
    }
  });
};

export default { verifyToken, verifyUser, verifyAdmin };