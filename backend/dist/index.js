import { WebSocketServer, WebSocket } from "ws";
const MAX_MESSAGE_LENGTH = 2_000;
const rooms = new Map();
const socketRooms = new WeakMap();
const wss = new WebSocketServer({ port: Number(process.env.PORT ?? 8080) });
function send(socket, message) {
    if (socket.readyState === WebSocket.OPEN)
        socket.send(JSON.stringify(message));
}
function broadcastPresence(roomId) {
    const clients = rooms.get(roomId);
    if (!clients)
        return;
    const message = { type: "presence", payload: { count: clients.size } };
    clients.forEach((client) => send(client, message));
}
function leaveRoom(socket) {
    const roomId = socketRooms.get(socket);
    if (!roomId)
        return;
    const clients = rooms.get(roomId);
    clients?.delete(socket);
    socketRooms.delete(socket);
    if (!clients?.size)
        rooms.delete(roomId);
    else
        broadcastPresence(roomId);
}
function joinRoom(socket, roomId) {
    leaveRoom(socket);
    const clients = rooms.get(roomId) ?? new Set();
    clients.add(socket);
    rooms.set(roomId, clients);
    socketRooms.set(socket, roomId);
    broadcastPresence(roomId);
}
function parseMessage(raw) {
    try {
        return JSON.parse(raw.toString());
    }
    catch {
        return null;
    }
}
wss.on("connection", (socket) => {
    socket.on("message", (raw) => {
        const message = parseMessage(raw);
        if (!message)
            return send(socket, { type: "error", payload: { message: "Invalid message format." } });
        if (message.type === "join") {
            const roomId = message.payload?.roomId?.trim().slice(0, 64);
            if (!roomId)
                return send(socket, { type: "error", payload: { message: "A valid room is required." } });
            return joinRoom(socket, roomId);
        }
        if (message.type === "chat") {
            const roomId = socketRooms.get(socket);
            const text = message.payload?.message?.trim();
            if (!roomId)
                return send(socket, { type: "error", payload: { message: "Join a room before sending a message." } });
            if (!text || text.length > MAX_MESSAGE_LENGTH)
                return send(socket, { type: "error", payload: { message: `Messages must be 1–${MAX_MESSAGE_LENGTH} characters.` } });
            const outgoing = { type: "chat", payload: { id: crypto.randomUUID(), message: text, sentAt: new Date().toISOString() } };
            rooms.get(roomId)?.forEach((client) => send(client, outgoing));
        }
    });
    socket.on("close", () => leaveRoom(socket));
    socket.on("error", () => leaveRoom(socket));
});
wss.on("listening", () => console.log("WebSocket server listening on port 8080"));
//# sourceMappingURL=index.js.map