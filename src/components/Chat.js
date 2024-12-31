import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchMessages, sendMessage } from "../api/api";
import { getSocket } from "./socket";

const Chat = ({ userId, token }) => {
  const { eventId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socket = getSocket();

  useEffect(() => {
    console.log("Component mounted. Event ID:", eventId); // Debug log

    const fetchMessages = async () => {
      console.log("Fetching messages for Event ID:", eventId); // Debug log
      try {
        const res = await fetchMessages(eventId);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();

    // Listen for real-time messages
    socket.emit("joinChat", eventId);
    socket.on(`chat_${eventId}`, (messageData) => {
      console.log("Real-time message received:", messageData); // Debug log
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    return () => {
      console.log("Cleaning up socket listeners for Event ID:", eventId); // Debug log
      socket.off(`chat_${eventId}`);
    };
  }, [eventId, token]);

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      console.warn("Attempted to send an empty message"); // Debug log
      return;
    }

    const messageData = {
      chatId: eventId,
      sender: userId,
      message: newMessage,
      timestamp: new Date(),
    };

    console.log("Sending message:", messageData); // Debug log

    try {
      const res = await fetch(`/api/chat/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });

      if (!res.ok) {
        console.error("Failed to send message:", res.status, res.statusText);
        return;
      }

      const newMsg = await res.json();
      console.log("Message successfully sent. Server response:", newMsg); // Debug log

      // Emit the message for real-time updates
      console.log("Emitting message to WebSocket:", newMsg); // Debug log
      socket.emit("sendMessage", newMsg);

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div>
      <h2>Chat</h2>
      <div
        style={{
          maxHeight: "300px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender.username}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => {
          console.log("User typing message:", e.target.value); // Debug log
          setNewMessage(e.target.value);
        }}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
