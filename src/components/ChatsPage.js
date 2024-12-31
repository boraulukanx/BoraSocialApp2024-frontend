import React, { useState, useEffect } from "react";
import {
  getPrivateChats,
  getAvailableToChatUsers,
  startPrivateChat,
} from "../api/api";
import { useNavigate } from "react-router-dom";
import "./ChatsPage.css";

const ChatsPage = ({ userId }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoadingChats(true);
      try {
        const res = await getPrivateChats(userId);
        setChats(res.data);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
      setIsLoadingChats(false);
    };
    fetchChats();
  }, [userId]);

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const res = await getAvailableToChatUsers(userId);
        setAvailableUsers(res.data);
      } catch (err) {
        console.error("Error fetching available users:", err);
      }
      setIsLoadingUsers(false);
    };
    fetchAvailableUsers();
  }, [userId]);

  const handleStartChat = async (otherUserId) => {
    console.log("Starting chat with:", { userId, otherUserId }); // Debugging log

    // Validate user IDs
    if (!userId || !otherUserId) {
      console.error("Invalid user details for starting chat.");
      setError("Invalid user details for starting chat.");
      return;
    }

    setIsStartingChat(true); // Set loading state
    try {
      // Make API call to get or create a chat
      const res = await startPrivateChat({
        userId1: userId,
        userId2: otherUserId,
      });

      console.log("API response:", res.data); // Debug response

      if (res.data && res.data._id) {
        // If the chat is successfully created or fetched, navigate to it
        navigate(`/chat/${res.data._id}`);
      } else {
        console.error("Failed to create or fetch chat:", res);
        setError(
          "Failed to start a new chat. Invalid response from the server."
        );
      }
    } catch (err) {
      // Catch and log any errors
      console.error("Error starting chat:", err.response || err.message);
      setError(
        err.response?.data?.message ||
          "An error occurred while starting the chat. Please try again."
      );
    } finally {
      setIsStartingChat(false); // Reset loading state
    }
  };

  return (
    <div className="chats-page">
      {error && <div className="error-message">{error}</div>}

      {isLoadingUsers ? (
        <p>Loading users...</p>
      ) : (
        <div className="start-chat-section">
          <h2>Start a New Chat</h2>
          <ul className="users-list">
            {availableUsers.map((user) => (
              <li
                key={user._id}
                className="user-item"
                onClick={() => handleStartChat(user._id)}
              >
                <div className="user-info">
                  <img
                    src={`${user.profilePicture || "/default.png"}`}
                    alt={user.username}
                    className="user-avatar"
                  />
                  <span className="username">{user.username}</span>
                </div>
              </li>
            ))}
          </ul>
          {isStartingChat && <p>Starting chat...</p>}
        </div>
      )}

      <div className="previous-chats-section">
        <h2>Previous Chats</h2>
        {isLoadingChats ? (
          <p>Loading chats...</p>
        ) : chats.length === 0 ? (
          <p>No previous chats to display.</p>
        ) : (
          <ul className="chats-list">
            {chats.map((chat) => (
              <li
                key={chat._id}
                className="chat-item"
                onClick={() => navigate(`/chat/${chat._id}`)}
              >
                <div className="chat-info">
                  <img
                    src={
                      chat.participants.find((p) => p._id !== userId)
                        ?.profilePicture || "/default.png"
                    }
                    alt="Avatar"
                    className="user-avatar"
                  />
                  <span className="username">
                    {chat.participants.find((p) => p._id !== userId)
                      ?.username || "Unknown"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatsPage;
