# Real-Time Chat App

A real-time chat application built with **WebSockets**, **TypeScript**, and **React**. Users can join a room, send messages, and see them delivered instantly to everyone else in the same room.

## Features

- Real-time messaging over WebSockets
- Join or create chat rooms with a room code
- Live user join/leave notifications
- Typing indicators
- Auto-reconnect when the connection drops
- Fully typed client and server (shared message types)
- Responsive UI built with React

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Frontend  | React, TypeScript, Vite             |
| Backend   | Node.js, TypeScript, `ws`           |
| Protocol  | WebSocket (JSON messages)           |

## Project Structure

```
realtime-chat/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # ChatWindow, MessageList, MessageInput
│   │   ├── hooks/          # useWebSocket hook
│   │   ├── types/          # Shared message types
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── server/                 # WebSocket server
│   ├── src/
│   │   ├── index.ts        # Server entry point
│   │   └── rooms.ts        # Room management logic
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/basic-chat-app.git
cd basic-chat-app
```

### 2. Start the server

```bash
cd server
npm install
npm run dev
```

The WebSocket server runs on `ws://localhost:8080` by default.

### 3. Start the client

```bash
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

Open it in two browser tabs, join the same room, and start chatting.

## How It Works

1. The client opens a WebSocket connection to the server.
2. The user sends a `join` message with a room ID and username.
3. The server adds the socket to that room.
4. Any `chat` message is broadcast to every client in the same room.
5. When a socket closes, the server removes it and notifies the room.

### Message Protocol

All messages are JSON with a `type` field.

**Client → Server**

```json
{ "type": "join", "payload": { "roomId": "abc123", "username": "Abdul" } }
{ "type": "chat", "payload": { "message": "Hello!" } }
{ "type": "typing", "payload": { "isTyping": true } }
```

**Server → Client**

```json
{ "type": "chat", "payload": { "username": "Abdul", "message": "Hello!", "timestamp": 1700000000000 } }
{ "type": "system", "payload": { "message": "Abdul joined the room" } }
{ "type": "typing", "payload": { "username": "Abdul", "isTyping": true } }
```

### Shared Types (TypeScript)

```ts
export type ClientMessage =
  | { type: "join"; payload: { roomId: string; username: string } }
  | { type: "chat"; payload: { message: string } }
  | { type: "typing"; payload: { isTyping: boolean } };

export type ServerMessage =
  | { type: "chat"; payload: { username: string; message: string; timestamp: number } }
  | { type: "system"; payload: { message: string } }
  | { type: "typing"; payload: { username: string; isTyping: boolean } };
```

## Environment Variables

**Server** (`server/.env`)

```
PORT=8080
```

**Client** (`client/.env`)

```
VITE_WS_URL=ws://localhost:8080
```

## Scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start in development mode        |
| `npm run build`   | Compile TypeScript / build app   |
| `npm start`       | Run the production server build  |

## Future Improvements

- User authentication
- Message persistence with a database (PostgreSQL / MongoDB)
- Private direct messages
- Online users list
- File and image sharing
- Deployment with Docker

## Contributing

Contributions are welcome. Fork the repo, create a feature branch, and open a pull request.

## License

This project is licensed under the MIT License.

## Author

**Abdul** — [GitHub](https://github.com/Abdulajij427)
