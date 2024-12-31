import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Auth from "./components/Auth";
import HomePage from "./components/HomePage";
import EventList from "./components/EventList";
import EventDetails from "./components/EventDetails";
import ChatsPage from "./components/ChatsPage";
import ProfilePage from "./components/ProfilePage";
import PrivateChat from "./components/PrivateChat";
import MapPage from "./components/MapPage";
import { initializeSocket } from "./components/socket";
import CreateEvent from "./components/CreateEvent";
import FollowingsPage from "./components/FollowingsPage";
import FollowersPage from "./components/FollowersPage";
import Chat from "./components/Chat";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";

import "./App.css";

const AppContent = ({ userId, socketInitialized }) => {
  const location = useLocation();

  // Determine if the current route is an authentication route
  const isAuthRoute =
    location.pathname === "/" || location.pathname === "/register";

  return (
    <div className="app-container">
      {/* Conditionally render Topbar and Sidebar */}
      {!isAuthRoute && <Topbar />}
      {!isAuthRoute && <Sidebar />}
      <div className={`main-content ${isAuthRoute ? "auth-content" : ""}`}>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/events" element={<EventList userId={userId} />} />
          <Route
            path="/event/:eventId"
            element={<EventDetails userId={userId} />}
          />
          <Route
            path="/event/details/:eventId"
            element={<EventDetails userId={userId} detailsOnly={true} />}
          />
          <Route path="/chats" element={<ChatsPage userId={userId} />} />
          <Route
            path="/chat/:chatId"
            element={
              socketInitialized ? (
                <PrivateChat userId={userId} />
              ) : (
                <p>Initializing chat...</p>
              )
            }
          />
          <Route
            path="/event/chat/:eventId"
            element={<Chat userId={userId} />}
          />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/:id/followings" element={<FollowingsPage />} />
          <Route path="/:id/followers" element={<FollowersPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route
            path="/create-event"
            element={<CreateEvent userId={userId} />}
          />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  const [socketInitialized, setSocketInitialized] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      initializeSocket();
      setSocketInitialized(true);
    }
  }, []);

  return (
    <Router>
      <AppContent userId={userId} socketInitialized={socketInitialized} />
    </Router>
  );
};

export default App;
