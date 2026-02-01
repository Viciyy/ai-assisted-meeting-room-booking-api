/**
 * Booking routes
 */

const express = require('express');
const router = express.Router();
const bookingStore = require('../storage/bookingStore');
const validators = require('../validators/bookingValidators');

/**
 * Create a booking
 * POST /bookings
 */
router.post('/', (req, res) => {
  const { roomId, startTime, endTime } = req.body;

  // Validate booking
  const validation = validators.validateBooking(roomId, startTime, endTime);
  if (!validation.valid) {
    const response = { error: validation.error };
    if (validation.conflictingBooking) {
      response.conflictingBooking = validation.conflictingBooking;
    }
    return res.status(validation.status).json(response);
  }

  // Create the booking
  const booking = bookingStore.createBooking(roomId, startTime, endTime);
  res.status(201).json(booking);
});

/**
 * Cancel a booking
 * DELETE /bookings/:id
 */
router.delete('/:id', (req, res) => {
  // Validate booking ID
  const idValidation = validators.validateBookingId(req.params.id);
  if (!idValidation.valid) {
    return res.status(idValidation.status).json({ error: idValidation.error });
  }

  const { bookingId } = idValidation;
  const index = bookingStore.findBookingIndex(bookingId);

  if (index === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const cancelledBooking = bookingStore.deleteBookingByIndex(index);
  res.json({ message: 'Booking cancelled successfully', booking: cancelledBooking });
});

module.exports = router;
