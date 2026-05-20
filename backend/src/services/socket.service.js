// services/socket.service.js

const { Server } = require("socket.io");

// TODO: Import your Message model here
const Message = require("../models/message.model");

let io;

const initializeSocket = async (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // for development
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);
    
    socket.on("joinAdminRoom", () => {
  socket.join("admin");
  console.log("👑 Admin joined admin room");
});

    // Handle socket events here
    // ...

    // 🟢 EMPLOYEE TO ADMIN NOTIFICATIONS
    socket.on("notifyAdmins", (notification) => {
      console.log("🔔 Notification sent to admins:", notification);
      io.to("admin").emit("notification", notification);
    });

socket.on("attendanceApproved", ({ employeeId, adminName }) => {
  const notification = {
    title: "Attendance Approved",
    message: `Approved by ${adminName}`,
    type: "attendance",
  };

  io.to(employeeId).emit("notification", notification);
});



// project room
    socket.on("joinProject",async (projectId,name) => {
      console.log(`Socket ${socket.id} joined project ${projectId} and ${name}`);

      await socket.join(projectId);

      io.to(projectId).emit("joinRoom", `${name} joined the room ${projectId}`); // Notify others in the room
    });

    // Join a specific room for personal user notifications
    socket.on("joinUserRoom", (userId) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined user room ${userId}`);
    });

    socket.on("sendMessage", async (data) => {
      const { projectId, senderId, senderName, text } = data;
      
      // 1. Save message to database (Uncomment when Model is created)
      const savedMessage = await Message.create({
        projectId,
        senderId,
        senderName,
        text
      });

      const messagePayload = {
        _id: savedMessage._id, // Replace with savedMessage._id
        projectId,
        senderId,
        senderName,
        text,
        createdAt: savedMessage.createdAt // Replace with savedMessage.createdAt
      };

      // Broadcast to everyone else in the project room
      socket.to(projectId).emit("newMessage", messagePayload);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  return io;
};



// 👉 export getter
const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

module.exports = { initializeSocket, getIO };