const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'havoshari_super_secret_key_123!';

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    let user = await prisma.user.findUnique({ where: { username } });
    
    // Auto-create admin if env matches and user not found
    if (!user && username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const hash = await bcrypt.hash(password, 10);
      user = await prisma.user.create({ data: { username, passwordHash: hash, role: 'admin' } });
    }

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    next(err);
  }
};

exports.getConfig = (req, res) => {
  res.json({
    cardNumber: process.env.CARD_NUMBER,
    cardHolderInfo: process.env.CARD_HOLDER_INFO
  });
};
