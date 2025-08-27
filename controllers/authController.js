// gym-app/server/controllers/authController.js
import db from "../models/index.js"; // Import default export
import bcrypt from "bcryptjs";
import createError from "../utils/errors.js";
import jwt from "jsonwebtoken";
import Joi from "joi";

const { User } = db;

const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  mobileNo: Joi.string().pattern(/^[0-9]{10}$/).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return next(createError(400, error.details[0].message));

    const { name, email, password, mobileNo } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return next(createError(400, "Email already registered"));

    const user = await User.create({ name, email, password, mobileNo, status: 'active' });
    const { password: pass, isAdmin, ...otherDetails } = user.dataValues;
    res.status(201).json(otherDetails);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return next(createError(400, error.details[0].message));

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return next(createError(404, "User not found"));
    if (user.status === 'inactive') return next(createError(403, "Account is inactive"));

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return next(createError(400, "Email or password doesn't match"));

    if (!process.env.JWT_SECRET_KEY) {
      return next(createError(500, "JWT secret key not configured"));
    }

    const token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    const { password: pass, isAdmin, ...otherDetails } = user.dataValues;
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      })
      .status(200)
      .json(otherDetails);
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) return res.status(200).json({ message: "No active session" });

    jwt.verify(token, process.env.JWT_SECRET_KEY);
    res.clearCookie("access_token", { httpOnly: true, sameSite: "Strict" });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(createError(401, "Invalid token"));
  }
};

export { register, login, logout };