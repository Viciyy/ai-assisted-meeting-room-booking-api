/**
 * Meeting Room Booking API
 * Main application entry point
 */

const express = require('express');

// Import routes
const bookingRoutes = require('./routes/bookings');
const roomRoutes = require('./routes/rooms');

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/bookings', bookingRoutes);
app.use('/rooms', roomRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Meeting Room Booking API running on port ${PORT}`);
});

module.exports = app;
