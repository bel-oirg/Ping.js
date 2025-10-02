# Black-Hole-js Real-Time Notification Architecture

## Overview

The Gateway service implements a real-time notification system that connects Kafka events to WebSocket communications with the frontend. This architecture focuses on two key Kafka topics:

- `newRelation`: For friendship events (requests, accepts, etc.)
- `newMsg`: For direct messaging between users

## Notification Types

The system differentiates between two types of notifications:

### 1. User-Facing Notifications

These appear in the user's notification center and provide visible alerts:

- **Friend Request** (`newRelation`, requestType=1): When someone sends a friend request
- **Friend Accept** (`newRelation`, requestType=2): When someone accepts a friend request
- **New Message** (`newMsg`): When someone sends a direct message

### 2. Content Updates

These silently update UI components without showing a notification:

- **Friend Request Deny** (`newRelation`, requestType=3)
- **Friend Request Cancel** (`newRelation`, requestType=4)
- **User Block** (`newRelation`, requestType=-1)
- **User Unblock** (`newRelation`, requestType=-2)
- **Unfriend** (`newRelation`, requestType=-3)
- **Message Delivery Status** (internally generated)

## Architecture Components

### 1. Kafka Consumer (`utils/kafkaConsumer.js`)

Listens for events on:
- `newRelation` topic
- `newMsg` topic

Processes these events based on their type and dispatches appropriate notifications.

### 2. WebSocket System (`plugins/socket.js`)

- Manages connections from frontend clients
- Tracks user online status
- Monitors user location within the app (which page they're on)
- Sends notifications to appropriate clients

### 3. Notification Sender (`utils/notificationSender.js`)

Provides standardized methods for sending notifications:
- `sendNotificationToUser`: For direct user notifications
- `broadcastNotification`: For sending to all users
- `sendNotificationToMultipleUsers`: For targeting specific groups

## Message Flow

### Friend Request Flow

1. User sends a friend request through the dash service
2. dash service produces a `newRelation` event with `requestType=1`
3. Gateway consumes the event and identifies it as a user-facing notification
4. Gateway sends a `newRelation` notification to the recipient
5. Frontend displays the notification in the notification center
6. If the recipient is on the friends page, a `friendshipUpdate` event is also sent to refresh the UI

### Message Flow

1. User sends a message through the chat service
2. chat service produces a `newMsg` event
3. Gateway consumes the event and sends a `newMsg` notification to the recipient
4. Gateway also sends a delivery confirmation to the sender
5. If either user is in the active chat conversation, a `chatUpdate` event is sent to update the UI in real-time

## WebSocket Events

### Server to Client

- `newRelation`: Notification for friend requests and acceptances
- `newMsg`: Notification for new messages
- `friendshipUpdate`: Content update for friendship changes
- `chatUpdate`: Content update for chat conversations
- `messageDelivered`: Delivery confirmation for sent messages

### Client to Server

- `route:change`: Updates the server about which page the user is viewing
- Connection/disconnection events for online status tracking

## Frontend Integration

Frontend components should listen for the appropriate WebSocket events:

| Component | Events to Listen For |
|-----------|---------------------|
| Notification Center | `newRelation` (type=1,2), `newMsg` |
| Friends Page | `friendshipUpdate` |
| Chat Conversations | `newMsg`, `chatUpdate`, `messageDelivered` |
| Profile Pages | `friendshipUpdate` |

## Configuration

The Gateway connects to Kafka with the client ID specified in the configuration and subscribes to the `newRelation` and `newMsg` topics. WebSocket connections are established on the `/gateway.socket` path.

## Data Format Examples

### Friend Request Notification

```json
{
  "type": "newRelation",
  "data": {
    "sender": 1,
    "receiver": 2,
    "requestType": 1,
    "created_at": "2023-07-05T12:34:56.789Z"
  }
}
```

### Message Notification

```json
{
  "type": "newMsg",
  "data": {
    "sender": 1,
    "receiver": 2,
    "msg": "Hello world!",
    "created_at": "2023-07-05T12:34:56.789Z"
  }
}
```

### Friendship Update (Content)

```json
{
  "type": "friendshipUpdate",
  "data": {
    "id": 1  // The ID of the user who initiated the change
  }
}
```

## Note

**Only userId is used for sender/receiver identification in all notification payloads and logic. Usernames are not used as identifiers and are not stored in the notification system.** 