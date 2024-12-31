import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    window.location = "/";
  };

  const handleProfile = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      navigate(`/profile/${userId}`);
    } else {
      alert("User is not logged in.");
    }
  };

  const handleEvents = () => {
    navigate(`/events`);
  };

  const handleChats = () => {
    navigate(`/chats`);
  };

  const handleMap = () => {
    navigate(`/map`);
  };

  const handleCreateEvent = () => {
    navigate(`/create-event`);
  };

  return (
    <div className="sidebar">
      <a onClick={handleEvents}>Search Events</a>

      <a onClick={handleEvents}>Search Events</a>
      <a onClick={handleCreateEvent}>Create Event</a>
      <a onClick={handleMap}>Social Map</a>
      <a onClick={handleProfile}>Profile</a>
      <a onClick={handleChats}>Chats</a>
      <a onClick={handleLogout}>Logout</a>
    </div>
  );
};

export default Sidebar;
