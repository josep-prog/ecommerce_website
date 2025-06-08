import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { streamClient } from '../index.js';

// Helper function to transform user data
const transformUser = (user) => {
  const userObj = user.toObject();
  return {
    id: userObj._id,
    name: userObj.name,
    email: userObj.email,
    role: userObj.role,
    avatar: userObj.avatar
  };
};

// Register user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10)
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: transformUser(user)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: transformUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: transformUser(user) });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate Stream Chat token
export const generateChatToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create token with user role and permissions
    const token = streamClient.createToken(user._id.toString(), {
      role: user.role || 'user',
      permissions: {
        'read-channel': ['*'],
        'write-channel': ['*'],
        'join-channel': ['*'],
        'create-channel': user.role === 'admin' ? ['*'] : [],
        'delete-channel': user.role === 'admin' ? ['*'] : [],
        'update-channel': user.role === 'admin' ? ['*'] : [],
        'query-channels': user.role === 'admin' ? ['*'] : []  // Allow admins to query all channels
      }
    });

    res.json({ token });
  } catch (error) {
    console.error('Error generating chat token:', error);
    res.status(500).json({ message: 'Error generating chat token' });
  }
}; 