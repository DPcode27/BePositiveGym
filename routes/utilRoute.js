// gym-app/server/routes/utilRoute.js
import express from 'express';
import verifyToken from '../utils/verifyToken.js'; // Import default export
import { Op } from 'sequelize';
import db from '../models/index.js';

const { User } = db.models;

const router = express.Router();

// Placeholder for getMatchingFileNames (search users by name)
const getMatchingFileNames = async (req, res, next) => {
  try {
    const { query } = req.query; // Expect a query parameter (e.g., ?query=John)
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const users = await User.findAll({
      where: {
        name: { [Op.iLike]: `%${query}%` }, // Case-insensitive search
        status: 'active', // Only return active users
      },
      attributes: { exclude: ['password'] }, // Exclude sensitive fields
    });

    res.json(users);
  } catch (err) {
    next(createError(500, err.message));
  }
};

router.get('/search', verifyToken.verifyUser, getMatchingFileNames);

export default router;