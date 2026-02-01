const express = require('express');

const app = express();
app.use(express.json());

// In-memory storage for bookings
const bookings = [];
let nextBookingId = 1;

// Helper function to check if two time ranges overlap
function timesOverlap(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

// Helper function to find overlapping bookings for a room
function findOverlappingBooking(roomId, startTime, endTime, excludeBookingId = null) {
  return bookings.find(booking => 
    booking.roomId === roomId &&
    booking.id !== excludeBookingId &&
    timesOverlap(new Date(startTime), new Date(endTime), new Date(booking.startTime), new Date(booking.endTime))
  );
}

// Create a booking
app.post('/bookings', (req, res) => {
  const { roomId, startTime, endTime } = req.body;

  // Validate required fields
  if (!roomId || !startTime || !endTime) {
    return res.status(400).json({ error: 'roomId, startTime, and endTime are required' });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  // Validate dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  // Business rule: Start time must be before end time
  if (start >= end) {
    return res.status(400).json({ error: 'Start time must be before end time' });
  }

  // Business rule: Bookings cannot be in the past
  if (start < now) {
    return res.status(400).json({ error: 'Bookings cannot be in the past' });
  }

  // Business rule: Bookings must not overlap for the same room
  const overlapping = findOverlappingBooking(roomId, startTime, endTime);
  if (overlapping) {
    return res.status(409).json({ error: 'Booking overlaps with an existing booking', conflictingBooking: overlapping });
  }

  // Create the booking
  const booking = {
    id: nextBookingId++,
    roomId,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    createdAt: now.toISOString()
  };

  bookings.push(booking);
  res.status(201).json(booking);
});

// Cancel a booking
app.delete('/bookings/:id', (req, res) => {
  const bookingId = parseInt(req.params.id, 10);

  if (isNaN(bookingId)) {
    return res.status(400).json({ error: 'Invalid booking ID' });
  }

  const index = bookings.findIndex(booking => booking.id === bookingId);

  if (index === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const [cancelledBooking] = bookings.splice(index, 1);
  res.json({ message: 'Booking cancelled successfully', booking: cancelledBooking });
});

// List all bookings for a specific room
app.get('/rooms/:roomId/bookings', (req, res) => {
  const { roomId } = req.params;

  const roomBookings = bookings
    .filter(booking => booking.roomId === roomId)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  res.json(roomBookings);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Meeting Room Booking API running on port ${PORT}`);
});

module.exports = app;
