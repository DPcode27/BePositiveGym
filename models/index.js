import { Sequelize, DataTypes } from 'sequelize';
import userModel from './user.js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize database object
const db = {};

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: 'postgres',
    dialectOptions: process.env.DATABASE_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
);

// Initialize models
db.User = userModel(sequelize, DataTypes);

// Set up associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export Sequelize instance and models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;