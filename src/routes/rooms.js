/**
 * Room routes
 */

const express = require('express');
const router = express.Router();
const bookingStore = require('../storage/bookingStore');

/**
 * List all bookings for a specific room
 * GET /rooms/:roomId/bookings
 */
router.get('/:roomId/bookings', (req, res) => {
  const { roomId } = req.params;
  const roomBookings = bookingStore.getBookingsByRoom(roomId);
  res.json(roomBookings);
});

module.exports = router;
