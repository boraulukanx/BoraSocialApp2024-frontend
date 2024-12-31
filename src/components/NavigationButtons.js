import React from "react";
import { useNavigate } from "react-router-dom";

const NavigationButtons = () => {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      navigate(`/profile/${userId}`);
    } else {
      alert("User is not logged in.");
    }
  };

  const handleGoToEvents = () => {
    navigate(`/events`);
  };

  const handleGoToChats = () => {
    navigate(`/chats`);
  };

  const handleGoToMap = () => {
    navigate(`/map`);
  };
  const handleCreateEvent = () => {
    navigate(`/create-event`);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginTop: "20px",
      }}
    >
      <button onClick={handleGoToProfile}>Go to Profile</button>
      <button onClick={handleGoToChats}>Chats</button>
      <button onClick={handleGoToMap}>Social Map</button>
      <button onClick={handleCreateEvent}>Create Event</button>
      <button onClick={handleGoToEvents}>Events</button>
    </div>
  );
};

export default NavigationButtons;
