import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { StreamChat } from 'stream-chat';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js';
import { errorHandler } from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRoutes from './routes/upload.js';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3001;

// Debug: Log environment variables
console.log('Environment variables loaded:', {
  PORT,
  MONGO_URI: process.env.MONGO_URI ? 'MongoDB URI is set' : 'MongoDB URI is not set',
  JWT_SECRET: process.env.JWT_SECRET_KEY ? 'JWT Secret is set' : 'JWT Secret is not set',
  STREAM_API_KEY: process.env.STREAM_API_KEY,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET,
  CLIENT_URL: process.env.CLIENT_URL
});

// Initialize Stream Chat
const streamClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

// Configure default channel permissions
streamClient.updateAppSettings({
  permissions: {
    'messaging': {
      'read-channel': ['*'],
      'write-channel': ['*'],
      'join-channel': ['*'],
      'create-channel': ['admin'],
      'delete-channel': ['admin'],
      'update-channel': ['admin'],
      'query-channels': ['admin']
    }
  },
  channel_types: {
    messaging: {
      permissions: {
        'read-channel': ['*'],
        'write-channel': ['*'],
        'join-channel': ['*'],
        'create-channel': ['admin'],
        'delete-channel': ['admin'],
        'update-channel': ['admin'],
        'query-channels': ['admin']
      },
      commands: ['giphy', 'imgur'],
      max_message_length: 5000,
      allow_reactions: true,
      allow_threads: true,
      allow_typing_events: true,
      allow_read_events: true,
      allow_connect_events: true
    }
  }
}).catch(console.error);

// Export streamClient for use in other files
export { streamClient };

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Debug: Log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use(errorHandler);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}`);
      console.log(`Client URL: ${process.env.CLIENT_URL}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
