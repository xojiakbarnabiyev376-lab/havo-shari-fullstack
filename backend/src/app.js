const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const errorMiddleware = require('./middlewares/error');

const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const packageRoutes = require('./routes/package.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();

// Security & Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow images to be loaded from /uploads
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate Limiting (Spam prevention)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/stats', statsRoutes);

// Error Handling
app.use(errorMiddleware);

module.exports = app;
