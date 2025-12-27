import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 5001;
const ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ORIGIN,
    methods: ["GET", "POST"],
  },
});

const typingUsers = new Set();

io.on("connection", (socket) => {
  socket.on("user_joined", (name) => {
    socket.data.username = name;
    socket.broadcast.emit("receive_message", {
      user: "System",
      text: `${name} joined the room`,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on("send_message", (data) => {
    if (socket.data.username) {
      typingUsers.delete(socket.data.username);
      io.emit("typing_status", Array.from(typingUsers));
    }
    io.emit("receive_message", data);
  });

  socket.on("user_left", (name) => {
    typingUsers.delete(name);
    io.emit("typing_status", Array.from(typingUsers));
    socket.broadcast.emit("receive_message", {
      user: "System",
      text: `${name} left the room`,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on("typing_start", (username) => {
    console.log(`[SERVER] typing_start received from: ${username}`);
    if (username && !typingUsers.has(username)) {
      typingUsers.add(username);
      const typingArray = Array.from(typingUsers);
      console.log(`[SERVER] Emitting typing_status:`, typingArray);

      io.emit("typing_status", typingArray);
    }
  });

  socket.on("typing_stop", (username) => {
    console.log(`[SERVER] typing_stop received from: ${username}`);
    if (username && typingUsers.has(username)) {
      typingUsers.delete(username);
      const typingArray = Array.from(typingUsers);
      console.log(`[SERVER] Emitting typing_status:`, typingArray);
      io.emit("typing_status", typingArray);
    }
  });

  socket.on("disconnect", () => {
    if (socket.data.username) {
      typingUsers.delete(socket.data.username);
      io.emit("typing_status", Array.from(typingUsers));
      socket.broadcast.emit("receive_message", {
        user: "System",
        text: `${socket.data.username} disconnected`,
        time: new Date().toLocaleTimeString(),
      });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket server running on http://localhost:${PORT}`);
  console.log(`CORS origin: ${ORIGIN}`);
});
