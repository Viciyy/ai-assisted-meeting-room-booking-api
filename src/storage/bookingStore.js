/**
 * In-memory storage for bookings
 */

const bookings = [];
let nextBookingId = 1;

// Helper function to check if two time ranges overlap
function timesOverlap(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

/**
 * Find an overlapping booking for a room
 */
function findOverlappingBooking(roomId, startTime, endTime, excludeBookingId = null) {
  return bookings.find(booking => 
    booking.roomId === roomId &&
    booking.id !== excludeBookingId &&
    timesOverlap(new Date(startTime), new Date(endTime), new Date(booking.startTime), new Date(booking.endTime))
  );
}

/**
 * Get all bookings
 */
function getAllBookings() {
  return bookings;
}

/**
 * Get bookings for a specific room, sorted by start time
 */
function getBookingsByRoom(roomId) {
  return bookings
    .filter(booking => booking.roomId === roomId)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

/**
 * Find booking index by ID
 */
function findBookingIndex(bookingId) {
  return bookings.findIndex(booking => booking.id === bookingId);
}

/**
 * Create a new booking
 */
function createBooking(roomId, startTime, endTime) {
  const booking = {
    id: nextBookingId++,
    roomId,
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(),
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);
  return booking;
}

/**
 * Delete a booking by index
 */
function deleteBookingByIndex(index) {
  const [deletedBooking] = bookings.splice(index, 1);
  return deletedBooking;
}

module.exports = {
  findOverlappingBooking,
  getAllBookings,
  getBookingsByRoom,
  findBookingIndex,
  createBooking,
  deleteBookingByIndex
};
