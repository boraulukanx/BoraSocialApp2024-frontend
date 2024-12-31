import React, { useState, useEffect, useRef } from "react";
import { fetchPrivateMessages, sendPrivateMessage } from "../api/api";
import { useNavigate } from "react-router-dom";
import { getSocket } from "./socket";
import "./PrivateChat.css";

const PrivateChat = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatId = window.location.pathname.split("/")[2];

  const navigate = useNavigate();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();

    const fetchMessages = async () => {
      try {
        const res = await fetchPrivateMessages(chatId);
        setMessages(res.data.messages || []);
        scrollToBottom();
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();

    socket.emit("joinChat", chatId);

    socket.on("receiveMessage", (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
      scrollToBottom();
    });

    socket.on("typing", ({ userId: typingUserId }) => {
      if (typingUserId !== userId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      socket.emit("leaveChat", chatId);
      socket.off("receiveMessage");
      socket.off("typing");
    };
  }, [chatId, userId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const socket = getSocket();
    try {
      const messageData = {
        chatId,
        sender: userId,
        message: newMessage,
        timestamp: new Date(),
      };

      const res = await sendPrivateMessage(chatId, messageData);
      socket.emit("sendMessage", { ...res.data, chatId });
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
    <div className="chat-container">
      {/* Chat Header */}
      <header className="chat-header">
        <h2 className="chat-title">Messages</h2>
      </header>

      {/* Chat Main Area */}
      <div className="chat-main">
        <div className="messages-wrapper">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-row ${
                msg.sender._id === userId ? "sent" : "received"
              }`}
            >
              {msg.sender._id !== userId && (
                <div className="message-avatar-wrapper">
                  <img
                    src={`${
                      msg.sender.profilePicture || "/uploads/default-avatar.png"
                    }`}
                    alt={msg.sender.username}
                    className="message-avatar"
                    onClick={() => navigate(`/profile/${msg.sender._id}`)} // Navigate to user's profile
                    style={{ cursor: "pointer" }}
                  />
                </div>
              )}
              <div className="message-content">
                {msg.sender._id !== userId && (
                  <p className="message-username">
                    {msg.sender?.username || "Unknown User"}
                  </p>
                )}
                <p className="message-text">{msg.message}</p>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          {isTyping && <p className="typing-indicator">Someone is typing...</p>}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      {/* Chat Footer */}
      <footer className="chat-footer">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="send-button" onClick={handleSendMessage}>
          <span>➤</span>
        </button>
      </footer>
    </div>
  );
};

export default PrivateChat;
