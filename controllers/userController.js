import db from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import createError from '../utils/errors.js';

const { User } = db;

const createUserSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  mobileNo: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  isAdmin: Joi.boolean().optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
});

// Middleware to restrict to admins
const restrictToAdmin = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return next(createError(401, 'Unauthorized: No token provided'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded.isAdmin) return next(createError(403, 'Forbidden: Admin access required'));
    req.user = decoded;
    next();
  } catch (error) {
    next(createError(401, 'Invalid token'));
  }
};

// Create a new user (admin-only)
const createUser = async (req, res, next) => {
  try {
    const { error } = createUserSchema.validate(req.body);
    if (error) return next(createError(400, error.details[0].message));

    const { name, email, password, mobileNo, isAdmin, status } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return next(createError(400, 'Email already registered'));

    const user = await User.create({
      name,
      email,
      password,
      mobileNo,
      isAdmin: isAdmin || false,
      status: status || 'active',
    });

    if (!process.env.JWT_SECRET_KEY) {
      return next(createError(500, 'JWT secret key not configured'));
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    const { password: _, ...userData } = user.dataValues;
    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      })
      .status(201)
      .json({ user: userData, token });
  } catch (err) {
    next(createError(400, err.message));
  }
};

// Get all users (admin-only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });
    res.status(200).json(users);
  } catch (err) {
    next(createError(400, err.message));
  }
};

// Get a user by ID (admin or self)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (user) {
      res.status(200).json(user);
    } else {
      next(createError(404, 'User not found'));
    }
  } catch (err) {
    next(createError(400, err.message));
  }
};

// Update a user by ID (admin-only)
const updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body; // Allow status, exclude password
    const [updated] = await User.update(updateData, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedUser = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] },
      });
      res.status(200).json(updatedUser);
    } else {
      next(createError(404, 'User not found'));
    }
  } catch (err) {
    next(createError(400, err.message));
  }
};

// Delete a user by ID (admin-only, soft deletion)
const deleteUser = async (req, res, next) => {
  try {
    const deleted = await User.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(200).json({ message: 'User soft-deleted successfully' });
    } else {
      next(createError(404, 'User not found'));
    }
  } catch (err) {
    next(createError(400, err.message));
  }
};

export default {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  restrictToAdmin,
};