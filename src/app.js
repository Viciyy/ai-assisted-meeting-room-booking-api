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

// ============================================
// Business Rule Validators
// ============================================

// Validate that all required fields are present
function validateRequiredFields(roomId, startTime, endTime) {
  if (!roomId || !startTime || !endTime) {
    return { valid: false, error: 'roomId, startTime, and endTime are required', status: 400 };
  }
  return { valid: true };
}

// Validate that dates are in valid format
function validateDateFormat(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid date format', status: 400 };
  }
  return { valid: true, start, end };
}

// Validate that start time is before end time
function validateTimeOrder(start, end) {
  if (start >= end) {
    return { valid: false, error: 'Start time must be before end time', status: 400 };
  }
  return { valid: true };
}

// Validate that booking is not in the past
function validateNotInPast(start) {
  if (start < new Date()) {
    return { valid: false, error: 'Bookings cannot be in the past', status: 400 };
  }
  return { valid: true };
}

// Validate that booking does not overlap with existing bookings
function validateNoOverlap(roomId, startTime, endTime) {
  const overlapping = findOverlappingBooking(roomId, startTime, endTime);
  if (overlapping) {
    return { 
      valid: false, 
      error: 'Booking overlaps with an existing booking', 
      status: 409,
      conflictingBooking: overlapping 
    };
  }
  return { valid: true };
}

// Run all booking validations
function validateBooking(roomId, startTime, endTime) {
  // Check required fields
  const requiredCheck = validateRequiredFields(roomId, startTime, endTime);
  if (!requiredCheck.valid) return requiredCheck;

  // Check date format
  const dateCheck = validateDateFormat(startTime, endTime);
  if (!dateCheck.valid) return dateCheck;

  const { start, end } = dateCheck;

  // Check time order
  const orderCheck = validateTimeOrder(start, end);
  if (!orderCheck.valid) return orderCheck;

  // Check not in past
  const pastCheck = validateNotInPast(start);
  if (!pastCheck.valid) return pastCheck;

  // Check no overlap
  const overlapCheck = validateNoOverlap(roomId, startTime, endTime);
  if (!overlapCheck.valid) return overlapCheck;

  return { valid: true, start, end };
}

// ============================================
// Endpoints
// ============================================

// Create a booking
app.post('/bookings', (req, res) => {
  const { roomId, startTime, endTime } = req.body;

  // Validate booking
  const validation = validateBooking(roomId, startTime, endTime);
  if (!validation.valid) {
    const response = { error: validation.error };
    if (validation.conflictingBooking) {
      response.conflictingBooking = validation.conflictingBooking;
    }
    return res.status(validation.status).json(response);
  }

  // Create the booking
  const booking = {
    id: nextBookingId++,
    roomId,
    startTime: validation.start.toISOString(),
    endTime: validation.end.toISOString(),
    createdAt: new Date().toISOString()
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
