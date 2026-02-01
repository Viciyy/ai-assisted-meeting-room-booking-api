# Meeting Room Booking API

A simple REST API for booking meeting rooms built with Node.js and Express.

## Setup

```bash
npm install
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server runs on `http://localhost:3000` by default.

## API Endpoints

### Create a Booking
```
POST /bookings
```

**Request Body:**
```json
{
  "roomId": "room-1",
  "startTime": "2026-02-01T10:00:00Z",
  "endTime": "2026-02-01T11:00:00Z"
}
```

**Response (201):**
```json
{
  "id": 1,
  "roomId": "room-1",
  "startTime": "2026-02-01T10:00:00.000Z",
  "endTime": "2026-02-01T11:00:00.000Z",
  "createdAt": "2026-02-01T09:00:00.000Z"
}
```

### Cancel a Booking
```
DELETE /bookings/:id
```

**Response (200):**
```json
{
  "message": "Booking cancelled successfully",
  "booking": { ... }
}
```

### List Bookings for a Room
```
GET /rooms/:roomId/bookings
```

**Response (200):**
```json
[
  {
    "id": 1,
    "roomId": "room-1",
    "startTime": "2026-02-01T10:00:00.000Z",
    "endTime": "2026-02-01T11:00:00.000Z",
    "createdAt": "2026-02-01T09:00:00.000Z"
  }
]
```

### Health Check
```
GET /health
```

## Business Rules

- Bookings must not overlap for the same room
- Bookings cannot be in the past
- Start time must be before end time
