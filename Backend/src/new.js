const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Store room information
const rooms = new Map();

// Helper function to get room info
const getRoomInfo = (roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      messages: [],
    });
  }
  return rooms.get(roomId);
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const { userId, userName, roomId } = socket.handshake.query;

  if (!userId || !userName || !roomId) {
    console.log("Missing required connection data");
    socket.disconnect();
    return;
  }

  const room = getRoomInfo(roomId);

  // Check if room is full (max 2 users)
  if (room.users.size >= 2 && !room.users.has(userId)) {
    console.log(`Room ${roomId} is full`);
    socket.emit("room-full");
    setTimeout(() => {
      socket.disconnect();
    }, 1000); // Disconnect after 1 second
    return;
  }

  socket.on("join-room", ({ userId, userName, roomId }) => {
    socket.join(roomId);
    socket.emit("connected");
    console.log("User joined room:", roomId, "with ID:", userId);
    // Now emit to the new user with info about others
    socket.to(roomId).emit("user-joined", { id: userId, name: userName });

    const otherUsers = Array.from(room.users.values()).filter(
      (user) => user.id !== userId
    );
    otherUsers.forEach((user) => {
      console.log("Sending existing user:", user, "to new user:", userName);
      socket.emit("user-joined", {
        id: user.id,
        name: user.name,
      });
    });
  });

  // Add user to room
  room.users.set(userId, {
    id: userId,
    name: userName,
    socketId: socket.id,
  });

  // Send existing messages to the new user
  room.messages.forEach((message) => {
    socket.emit("message", message);
  });

  // Send current users to the new user
  const otherUsers = Array.from(room.users.values()).filter(
    (user) => user.id !== userId
  );
  otherUsers.forEach((user) => {
    console.log("Sending existing user:", user, "to new user:", userName);
    socket.emit("user-joined", {
      id: user.id,
      name: user.name,
    });
  });

  console.log(
    `User ${userName} joined room ${roomId}. Room size: ${room.users.size}`
  );

  // Handle chat messages
  socket.on("send-message", (message) => {
    console.log("Message received:", message);

    // Validate message
    if (!message || !message.content || !message.senderId) {
      console.log("Invalid message format");
      return;
    }

    // Store message in room
    room.messages.push(message);

    // Broadcast to other users in the room
    socket.to(roomId).emit("message", message);
  });

  // WebRTC Signaling Events
  socket.on("call-offer", (data) => {
    console.log("Call offer from", userId, "to", data.to);

    if (!data.offer || !data.to) {
      console.log("Invalid call offer data");
      return;
    }

    // Find the target user's socket
    const targetUser = Array.from(room.users.values()).find(
      (user) => user.id === data.to
    );
    if (targetUser) {
      io.to(targetUser.socketId).emit("call-offer", {
        from: userId,
        offer: data.offer,
      });
    } else {
      console.log("Target user not found for call offer");
    }
  });

  socket.on("call-answer", (data) => {
    console.log("Call answer from", userId);

    if (!data.answer) {
      console.log("Invalid call answer data");
      return;
    }

    // Send answer to all other users in the room (should be just one)
    socket.to(roomId).emit("call-answer", {
      from: userId,
      answer: data.answer,
    });
  });

  socket.on("ice-candidate", (data) => {
    console.log("ICE candidate from", userId);

    if (!data.candidate) {
      console.log("Invalid ICE candidate data");
      return;
    }

    // Broadcast ICE candidate to other users in the room
    socket.to(roomId).emit("ice-candidate", {
      from: userId,
      candidate: data.candidate,
    });
  });

  socket.on("end-call", () => {
    console.log("Call ended by", userId);

    // Notify other users that the call ended
    socket.to(roomId).emit("call-ended", {
      from: userId,
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (room.users.has(userId)) {
      const user = room.users.get(userId);
      room.users.delete(userId);

      // Notify others in the room
      socket.to(roomId).emit("user-left", {
        id: userId,
        name: user.name,
      });

      console.log(
        `User ${user.name} left room ${roomId}. Room size: ${room.users.size}`
      );

      // Clean up empty rooms
      if (room.users.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      }
    }
  });

  // Error handling
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Error handling for the server
server.on("error", (error) => {
  console.error("Server error:", error);
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("WebRTC signaling server ready");
  console.log("CORS enabled for http://localhost:8080");
});
