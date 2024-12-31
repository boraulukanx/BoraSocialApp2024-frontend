import React, { useState, useEffect, useRef } from "react";
import { fetchMessages, sendMessage } from "../api/api";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Replace with your server's address

const ChatWindow = ({ eventId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await fetchMessages(eventId);
        setMessages(res.data);
        scrollToBottom();
      } catch (err) {
        console.error(err);
      }
    };

    loadMessages();

    // Join the chat room for this event
    const chatId = `chat_${eventId}`;
    socket.emit("joinChat", chatId);

    // Listen for new messages from the server
    socket.on("receiveMessage", (messageData) => {
      if (messageData.chatId === chatId) {
        setMessages((prevMessages) => [...prevMessages, messageData]);
        scrollToBottom();
      }
    });

    // Listen for typing indicator
    socket.on("typing", ({ userId: typingUserId }) => {
      if (typingUserId !== userId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    // Cleanup on component unmount
    return () => {
      socket.emit("leaveChat", chatId);
      socket.off("receiveMessage");
      socket.off("typing");
    };
  }, [eventId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        eventId,
        sender: userId,
        message: newMessage,
        timestamp: new Date(),
      };

      // Send the message to the server
      const res = await sendMessage(eventId, {
        sender: userId,
        message: newMessage,
      });

      // Emit the message to other participants via Socket.IO
      socket.emit("sendMessage", { ...res.data });

      // Update local messages immediately
      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "8px",
        maxWidth: "400px",
      }}
    >
      <div
        style={{
          maxHeight: "300px",
          overflowY: "scroll",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={`${
                  msg.sender.profilePicture || "/uploads/default-avatar.png"
                }`}
                alt={msg.sender.username}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  marginRight: "10px",
                }}
              />
              <strong>{msg.sender.username}</strong>
            </div>
            <p style={{ margin: "5px 0" }}>{msg.message}</p>
            <small style={{ color: "gray" }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </small>
          </div>
        ))}
        {isTyping && <p className="typing-indicator">Someone is typing...</p>}
        <div ref={messagesEndRef}></div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            socket.emit("typing", { chatId: `chat_${eventId}`, userId });
          }}
          placeholder="Type a message..."
          style={{ flexGrow: 1, marginRight: "10px", padding: "5px" }}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
