const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function sign(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function serialize(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    walletAddress: user.walletAddress,
    orgName: user.orgName,
    orgType: user.orgType,
  };
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, walletAddress, orgName, orgType } = req.body;
    const requestedRole = req.body.role || 'user';
    const role = ['user', 'auditor'].includes(requestedRole) ? requestedRole : 'user';

    if (!name || !email || !password || !walletAddress) {
      return res.status(400).json({ msg: 'name, email, password, and walletAddress are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'User exists' });

    const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const user = await User.create({ name, email, passwordHash, walletAddress, role, orgName, orgType });
    const token = sign(user);
    return res.status(201).json({ token, user: serialize(user) });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    if (role && user.role !== role) return res.status(403).json({ msg: `Account is not registered as ${role}` });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = sign(user);
    return res.json({ token, user: serialize(user) });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', err: err.message });
  }
};

exports.me = async (req, res) => {
  return res.json({ user: serialize(req.user) });
};
