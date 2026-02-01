/**
 * Simple API test script - no external dependencies
 * Usage: Start the server first (npm start), then run: node scripts/test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper to make HTTP requests
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Test utilities
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ ${message}`);
    failed++;
  }
}

function assertEq(actual, expected, message) {
  assert(actual === expected, `${message} (expected: ${expected}, got: ${actual})`);
}

// Get a future date (hours from now)
function futureDate(hoursFromNow) {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  return date.toISOString();
}

// Get a past date
function pastDate(hoursAgo) {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
}

// Test cases
async function runTests() {
  console.log('\n🧪 Meeting Room Booking API Tests\n');
  console.log('='.repeat(50));

  // Test 1: Health check
  console.log('\n📋 Test: Health Check');
  try {
    const res = await request('GET', '/health');
    assertEq(res.status, 200, 'Returns 200 status');
    assertEq(res.body.status, 'ok', 'Returns status ok');
  } catch (e) {
    console.log(`  ❌ Health check failed: ${e.message}`);
    console.log('\n⚠️  Is the server running? Start it with: npm start\n');
    process.exit(1);
  }

  // Test 2: Create a valid booking
  console.log('\n📋 Test: Create Valid Booking');
  const booking1 = {
    roomId: 'room-1',
    startTime: futureDate(1),
    endTime: futureDate(2),
  };
  const createRes = await request('POST', '/bookings', booking1);
  assertEq(createRes.status, 201, 'Returns 201 status');
  assert(createRes.body.id !== undefined, 'Returns booking ID');
  assertEq(createRes.body.roomId, 'room-1', 'Returns correct roomId');
  const bookingId = createRes.body.id;

  // Test 3: Create booking with missing fields
  console.log('\n📋 Test: Create Booking - Missing Fields');
  const missingRes = await request('POST', '/bookings', { roomId: 'room-1' });
  assertEq(missingRes.status, 400, 'Returns 400 for missing fields');

  // Test 4: Create booking in the past
  console.log('\n📋 Test: Create Booking - Past Date');
  const pastBooking = {
    roomId: 'room-2',
    startTime: pastDate(2),
    endTime: pastDate(1),
  };
  const pastRes = await request('POST', '/bookings', pastBooking);
  assertEq(pastRes.status, 400, 'Returns 400 for past booking');
  assert(pastRes.body.error.includes('past'), 'Error mentions past');

  // Test 5: Create booking with end before start
  console.log('\n📋 Test: Create Booking - End Before Start');
  const invalidBooking = {
    roomId: 'room-2',
    startTime: futureDate(3),
    endTime: futureDate(2),
  };
  const invalidRes = await request('POST', '/bookings', invalidBooking);
  assertEq(invalidRes.status, 400, 'Returns 400 for invalid time range');

  // Test 6: Create overlapping booking
  console.log('\n📋 Test: Create Booking - Overlapping');
  const overlappingBooking = {
    roomId: 'room-1',
    startTime: futureDate(1),
    endTime: futureDate(2),
  };
  const overlapRes = await request('POST', '/bookings', overlappingBooking);
  assertEq(overlapRes.status, 409, 'Returns 409 for overlapping booking');

  // Test 7: List bookings for a room
  console.log('\n📋 Test: List Bookings for Room');
  const listRes = await request('GET', '/rooms/room-1/bookings');
  assertEq(listRes.status, 200, 'Returns 200 status');
  assert(Array.isArray(listRes.body), 'Returns an array');
  assert(listRes.body.length >= 1, 'Has at least one booking');

  // Test 8: List bookings for empty room
  console.log('\n📋 Test: List Bookings - Empty Room');
  const emptyListRes = await request('GET', '/rooms/empty-room/bookings');
  assertEq(emptyListRes.status, 200, 'Returns 200 status');
  assertEq(emptyListRes.body.length, 0, 'Returns empty array');

  // Test 9: Cancel booking
  console.log('\n📋 Test: Cancel Booking');
  const cancelRes = await request('DELETE', `/bookings/${bookingId}`);
  assertEq(cancelRes.status, 200, 'Returns 200 status');
  assert(cancelRes.body.message.includes('cancelled'), 'Confirms cancellation');

  // Test 10: Cancel non-existent booking
  console.log('\n📋 Test: Cancel Non-Existent Booking');
  const notFoundRes = await request('DELETE', '/bookings/99999');
  assertEq(notFoundRes.status, 404, 'Returns 404 for non-existent booking');

  // Test 11: Cancel with invalid ID
  console.log('\n📋 Test: Cancel Invalid ID');
  const invalidIdRes = await request('DELETE', '/bookings/invalid');
  assertEq(invalidIdRes.status, 400, 'Returns 400 for invalid ID');

  // Test 12: Booking in different room should not conflict
  console.log('\n📋 Test: Different Rooms - No Conflict');
  const room2Booking = {
    roomId: 'room-2',
    startTime: futureDate(1),
    endTime: futureDate(2),
  };
  const room2Res = await request('POST', '/bookings', room2Booking);
  assertEq(room2Res.status, 201, 'Different room booking succeeds');

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
