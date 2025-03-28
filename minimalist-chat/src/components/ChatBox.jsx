import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./ChatBox.css";

const socket = io.connect("http://localhost:5000"); // Ensure correct server URL

const ChatBox = () => {
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        // Load previous messages once when the component mounts
        socket.on("previous_messages", (previousMessages) => {
            setMessages(previousMessages);
        });

        // Listen for new messages and update the chat
        socket.on("receive_message", (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        // Listen for chat clear event
        socket.on("chat_cleared", () => {
            setMessages([]); // Clears the chat
        });

        return () => {
            socket.off("previous_messages");
            socket.off("receive_message");
            socket.off("chat_cleared");
        };
    }, []);

    const sendMessage = () => {
        if (message.trim() !== "") {
            const newMessage = { user: username, text: message };
            socket.emit("send_message", newMessage);
            setMessage(""); // Clear input after sending
        }
    };

    const joinChat = () => {
        if (username.trim() !== "") {
            setJoined(true);
            socket.emit("join_chat", username);
        }
    };

    const leaveChat = () => {
        socket.emit("leave_chat", username);
        setJoined(false);
        setUsername("");
        setMessages([]); // Clear messages after leaving
    };

    const clearChat = () => {
        socket.emit("clear_chat"); // Notify server to clear chat
    };

    return (
        <div className="chat-container">
            {!joined ? (
                <div className="username-container">
                    <h2>Enter Username</h2>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your name"
                    />
                    <button onClick={joinChat}>Join Chat</button>
                </div>
            ) : (
                <>
                    <h2>Chat Anytime!</h2>
                    <div className="chat-box">
                        {messages.map((msg, index) => (
                            <p
                                key={index}
                                className={`chat-message ${
                                    msg.user === username ? "self" : "other"
                                }`}
                            >
                                <strong>{msg.user}:</strong> {msg.text}
                            </p>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button onClick={sendMessage}>Send</button>
                    <button onClick={clearChat} className="clear-btn">
                        Clear Chat
                    </button>
                    <button onClick={leaveChat} className="leave-btn">
                        Leave Chat
                    </button>
                </>
            )}
        </div>
    );
};

export default ChatBox;
