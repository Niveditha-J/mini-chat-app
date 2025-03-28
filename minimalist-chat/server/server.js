const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

let messages = []; // Stores chat messages
let users = {}; // Stores user socket IDs

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining
    socket.on("join_chat", (username) => {
        users[socket.id] = username;
        console.log(`${username} joined the chat.`);

        // Send only user messages (excluding system messages)
        const filteredMessages = messages.filter(msg => msg.type !== "system");
        socket.emit("previous_messages", filteredMessages);

        // Notify everyone that a new user joined
        const systemMessage = { user: "System", text: `${username} joined the chat`, type: "system" };
        messages.push(systemMessage);
        io.emit("receive_message", systemMessage);
    });

    // Listen for new messages
    socket.on("send_message", (data) => {
        const newMessage = { user: users[socket.id], text: data.text, type: "user" };
        messages.push(newMessage);

        io.emit("receive_message", newMessage); // Broadcast message to all users
    });

    // Handle clearing chat
    socket.on("clear_chat", (username) => {
        messages = []; // Clear stored messages
        console.log(`${username} cleared the chat.`);
        const systemMessage = { user: "System", text: `${username} cleared the chat.`, type: "system" };
        messages.push(systemMessage);
        io.emit("chat_cleared", systemMessage);
    });

    // Handle user leaving
    socket.on("leave_chat", () => {
        if (users[socket.id]) {
            const username = users[socket.id];
            console.log(`${username} left the chat.`);
            const systemMessage = { user: "System", text: `${username} left the chat`, type: "system" };
            messages.push(systemMessage);
            io.emit("receive_message", systemMessage);
            delete users[socket.id];
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        if (users[socket.id]) {
            const username = users[socket.id];
            console.log(`${username} disconnected.`);
            const systemMessage = { user: "System", text: `${username} disconnected`, type: "system" };
            messages.push(systemMessage);
            io.emit("receive_message", systemMessage);
            delete users[socket.id];
        }
    });
});

server.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
