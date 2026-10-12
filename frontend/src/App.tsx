import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

type ChatMessage = { id: string; message: string; sentAt: string };
type ConnectionState = "connecting" | "connected" | "reconnecting" | "offline";
const ROOM_ID = "purple";
const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:8080";

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [members, setMembers] = useState(0);
  const [notice, setNotice] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const retryRef = useRef(0);
  const shouldReconnectRef = useRef(true);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
  useEffect(() => {
    shouldReconnectRef.current = true;
    const connect = () => {
      setConnection(retryRef.current ? "reconnecting" : "connecting");
      const socket = new WebSocket(WS_URL); socketRef.current = socket;
      socket.onopen = () => { retryRef.current = 0; setConnection("connected"); setNotice(""); socket.send(JSON.stringify({ type: "join", payload: { roomId: ROOM_ID } })); };
      socket.onmessage = ({ data }) => { try { const event = JSON.parse(data as string); if (event.type === "chat") setMessages((current) => [...current, event.payload]); if (event.type === "presence") setMembers(event.payload.count); if (event.type === "error") setNotice(event.payload.message); } catch { setNotice("Received an unreadable server message."); } };
      socket.onclose = () => { if (!shouldReconnectRef.current) return; setConnection("offline"); reconnectTimerRef.current = window.setTimeout(connect, Math.min(1000 * 2 ** retryRef.current++, 10000)); };
      socket.onerror = () => socket.close();
    };
    connect();
    return () => { shouldReconnectRef.current = false; if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current); socketRef.current?.close(); };
  }, []);
  const sendMessage = useCallback(() => { const message = input.trim(); if (!message) return; if (socketRef.current?.readyState !== WebSocket.OPEN) return setNotice("Reconnecting—your message has not been sent yet."); socketRef.current.send(JSON.stringify({ type: "chat", payload: { message } })); setInput(""); inputRef.current?.focus(); }, [input]);
  const statusLabel = connection === "connected" ? "Live" : connection === "offline" ? "Reconnecting" : "Connecting";
  return <main className="chat-shell"><section className="chat-card" aria-label="Purple room chat"><header className="chat-header"><div className="room-mark" aria-hidden="true">#</div><div><p className="eyebrow">Room</p><h1>{ROOM_ID}</h1></div><div className={`connection ${connection === "connected" ? "is-live" : ""}`}><span />{statusLabel}</div></header><div className="room-meta"><span>{members} {members === 1 ? "member" : "members"} online</span><span>Real-time chat</span></div><div className="messages" role="log" aria-live="polite">{messages.length === 0 ? <div className="empty-state"><strong>Say hello 👋</strong><span>Your messages will appear here instantly.</span></div> : messages.map((item) => <article className="message" key={item.id}><div className="message-avatar">Y</div><div><div className="message-info"><strong>You</strong><time dateTime={item.sentAt}>{new Date(item.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div><p>{item.message}</p></div></article>)}<div ref={endRef} /></div>{notice && <p className="notice" role="status">{notice}</p>}<form className="composer" onSubmit={(event: FormEvent) => { event.preventDefault(); sendMessage(); }}><input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} maxLength={2000} placeholder={`Message #${ROOM_ID}`} aria-label="Message" autoFocus /><button type="submit" disabled={!input.trim() || connection !== "connected"}>Send <span>↵</span></button></form></section></main>;
}
export default App;



