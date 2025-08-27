// gym-app/server/index.js
// Main application file for the gym application API
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import db from './models/index.js';
import userRoute from './routes/userRoute.js';
import authRoute from './routes/authRoute.js';


const app = express();

// Configure multer for file uploads (e.g., profile images)
// const upload = multer({ dest: 'uploads/' });

// Global middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));
app.use(cookieParser());

// Routes
app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
// app.use('/api/util', utilRoute);

// Health check endpoint for Docker
app.get('/health', (req, res) => res.status(200).send('OK'));

// Example: File upload endpoint (e.g., for profile images)
// app.post('/api/upload', upload.single('file'), (req, res) => {
//   try {
//     res.status(200).json({ message: 'File uploaded successfully', file: req.file });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Global error handler
// app.use((err, req, res, next) => {
//   const errStatus = err.status || 500;
//   const errMsg = err.message || 'Something went wrong';
//   return res.status(errStatus).json({
//     success: false,
//     status: errStatus,
//     message: errMsg,
//     stack: process.env.NODE_ENV === 'development' ? undefined : err.stack,
//   });
// });

// Start server and connect to database
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected successfully');
    await db.sequelize.sync();
    const port = process.env.PORT;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

startServer();

export default app;