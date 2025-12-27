import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";
const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5001");
export default function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [hoveredUser, setHoveredUser] = useState(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const joinChat = () => {
    if (username.trim()) {
      socket.emit("user_joined", username);
      setJoined(true);
    }
  };

  const leaveChat = () => {
    socket.emit("user_left", username);
    setJoined(false);
    setMessages([]);
  };

  const sendMessage = () => {
    if (message.trim()) {
      const data = {
        user: username,
        text: message,
        time: new Date().toLocaleTimeString(),
      };
      socket.emit("send_message", data);
      socket.emit("typing_stop", username);
      setMessage("");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    if (newMessage.trim() && username) {
      console.log("User typing:", username);
      socket.emit("typing_start", username);
    
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        console.log("Stopping typing:", username);
        socket.emit("typing_stop", username);
        typingTimeoutRef.current = null;
      }, 2000);
    } else if (!newMessage.trim() && username) {
      console.log("Message empty, stopping typing:", username);
      socket.emit("typing_stop", username);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("typing_status", (users) => {
      console.log("Typing status received:", users);
      console.log("Current typingUsers state:", users);
      setTypingUsers(users);
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing_status");
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const firstLetter = (value) => (value?.[0] || "?").toUpperCase();

  if (!joined) {
    return (
      <div className="page">
        <div className="join-card">
          <div className="join-header">
            <div className="brand-icon">💬</div>
            <div>
              <h2 className="join-title">Realtime Chat</h2>
              <p className="hint">Simple, fast, and minimal</p>
            </div>
          </div>

          <p className="join-sub">
            Pick a display name and hop in. Everyone in the room will see it.
          </p>

          <div className="stack">
            <div className="input-group">
              <label className="label">Display name</label>
              <input
                className="input"
                placeholder="e.g. Sara Lee"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinChat()}
              />
            </div>

            <div className="action-row">
              <button className="btn btn-primary" onClick={joinChat}>
                Join room
              </button>
              <span className="hint">Press Enter to join quickly</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="chat-shell">
        <div className="topbar">
          <div className="brand">
            <div className="brand-icon">💬</div>
            <div>
              <div>Realtime Chat</div>
              <div className="hint">Room is live • Socket.io</div>
            </div>
          </div>

          <div className="status">
            <span className="pill">Signed in as {username}</span>
            <button className="btn btn-danger" onClick={leaveChat}>
              Leave
            </button>
          </div>
        </div>

        <div className="content">
          <div className="panel">
            <div className="welcome">
              <h3 className="title">Welcome, {username} 👋</h3>
              <p className="subtitle">
                This is a shared room. Your messages appear instantly for
                everyone connected.
              </p>
            </div>

            <div className="divider" />

           
            
            {/* Debug: Show typing users */}
            {typingUsers.length > 0 && (
              <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <strong>Typing now:</strong> {typingUsers.join(", ")}
              </div>
            )}
          </div>

          <div className="chat-area">
            <div className="messages">
              {messages.length === 0 ? (
                <div className="empty">No messages yet. Start the chat! 🚀</div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.user === username;
                  return (
                    <div
                      key={index}
                      className={`message ${isOwn ? "own" : ""}`}
                    >
                      <div 
                        className="msg-header"
                        onMouseEnter={() => {
                          console.log("Hovering over:", msg.user, "Typing users:", typingUsers);
                          setHoveredUser(msg.user);
                        }}
                        onMouseLeave={() => setHoveredUser(null)}
                      >
                        <div className="avatar">
                          {firstLetter(msg.user)}
                        </div>
                        <span className="author">{msg.user}</span>
                        <span className="timestamp">{msg.time}</span>
                        {hoveredUser === msg.user && (
                          <div className="typing-tooltip" style={{ display: 'block' }}>
                            {typingUsers && Array.isArray(typingUsers) && typingUsers.includes(msg.user) ? (
                              <span>✍️ {msg.user} is typing...</span>
                            ) : (
                              <span>💤 {msg.user} is not typing</span>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text">{msg.text}</p>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="composer">
              <textarea
                className="input"
                rows={2}
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... Press Enter to send"
              />
              <button className="btn btn-primary btn-send" onClick={sendMessage}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}