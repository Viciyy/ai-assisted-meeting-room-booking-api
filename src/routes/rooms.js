/**
 * Room routes
 */

const express = require('express');
const { param } = require('express-validator');
const router = express.Router();
const bookingStore = require('../storage/bookingStore');
const { validateRoomId } = require('../validators/bookingValidators');
const { sendValidationError, sendSuccess } = require('../http/responseHandler');

/**
 * List all bookings for a specific room
 * GET /rooms/:roomId/bookings
 */
router.get('/:roomId/bookings',
  // Sanitize inputs
  param('roomId').trim().escape(),
  (req, res) => {
    const { roomId } = req.params;

  // Validate roomId
  const roomIdValidation = validateRoomId(roomId);
  if (!roomIdValidation.valid) {
    return sendValidationError(res, roomIdValidation);
  }

  const roomBookings = bookingStore.getBookingsByRoom(roomId);
  sendSuccess(res, roomBookings);
  });

module.exports = router;
