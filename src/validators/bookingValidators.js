/**
 * Business rule validators for bookings
 */

const bookingStore = require('../storage/bookingStore');

/**
 * Validate that all required fields are present
 */
function validateRequiredFields(roomId, startTime, endTime) {
  if (!roomId || !startTime || !endTime) {
    return { valid: false, error: 'roomId, startTime, and endTime are required', status: 400 };
  }
  // Check that roomId is not just whitespace
  if (typeof roomId === 'string' && roomId.trim() === '') {
    return { valid: false, error: 'roomId cannot be empty or whitespace', status: 400 };
  }
  return { valid: true };
}

/**
 * Validate that dates are in valid format
 */
function validateDateFormat(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid date format', status: 400 };
  }
  return { valid: true, start, end };
}

/**
 * Validate that start time is before end time
 */
function validateTimeOrder(start, end) {
  if (start >= end) {
    return { valid: false, error: 'Start time must be before end time', status: 400 };
  }
  return { valid: true };
}

/**
 * Validate that booking is not in the past
 */
function validateNotInPast(start) {
  if (start < new Date()) {
    return { valid: false, error: 'Bookings cannot be in the past', status: 400 };
  }
  return { valid: true };
}

/**
 * Validate that booking does not overlap with existing bookings
 */
function validateNoOverlap(roomId, startTime, endTime) {
  const overlapping = bookingStore.findOverlappingBooking(roomId, startTime, endTime);
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

/**
 * Run all booking validations
 */
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

/**
 * Validate booking ID format
 */
function validateBookingId(id) {
  const bookingId = parseInt(id, 10);
  if (isNaN(bookingId)) {
    return { valid: false, error: 'Invalid booking ID', status: 400 };
  }
  return { valid: true, bookingId };
}

module.exports = {
  validateRequiredFields,
  validateDateFormat,
  validateTimeOrder,
  validateNotInPast,
  validateNoOverlap,
  validateBooking,
  validateBookingId
};
