/**
 * Booking routes
 * HTTP layer - handles request/response, delegates to business logic
 */

const express = require('express');
const router = express.Router();
const bookingStore = require('../storage/bookingStore');
const validators = require('../validators/bookingValidators');
const { sendValidationError, sendCreated, sendSuccess, sendError } = require('../http/responseHandler');
const ErrorTypes = require('../constants/errorTypes');

/**
 * Create a booking
 * POST /bookings
 */
router.post('/', (req, res) => {
  const { roomId, startTime, endTime } = req.body;

  // Validate booking (pure business logic)
  const validation = validators.validateBooking(roomId, startTime, endTime);
  if (!validation.valid) {
    return sendValidationError(res, validation);
  }

  // Create the booking
  const booking = bookingStore.createBooking(roomId, startTime, endTime);
  sendCreated(res, booking);
});

/**
 * Cancel a booking
 * DELETE /bookings/:id
 */
router.delete('/:id', (req, res) => {
  // Validate booking ID (pure business logic)
  const idValidation = validators.validateBookingId(req.params.id);
  if (!idValidation.valid) {
    return sendValidationError(res, idValidation);
  }

  const { bookingId } = idValidation;
  const index = bookingStore.findBookingIndex(bookingId);

  if (index === -1) {
    return sendError(res, ErrorTypes.BOOKING_NOT_FOUND, 'Booking not found');
  }

  const cancelledBooking = bookingStore.deleteBookingByIndex(index);
  sendSuccess(res, { message: 'Booking cancelled successfully', booking: cancelledBooking });
});

module.exports = router;
