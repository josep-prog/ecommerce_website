import User from '../models/User.js';

export const getAllClients = async (req, res) => {
  try {
    const clients = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.status(200).json({ clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 