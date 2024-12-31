import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HomePage.css"; // Include updated CSS

const HomePage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId"); // Get user ID from localStorage

  const handleGetStarted = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="homepage-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Bora Social App!</h1>
          <p className="hero-description">
            Your gateway to meeting new people, discovering events, and making
            memories. Join the community and explore endless possibilities.
          </p>
          <button onClick={handleGetStarted} className="hero-button">
            {userId ? "Go to Profile" : "Get Started"}
          </button>
        </div>
      </div>

      <div className="features-section">
        <h2 className="features-title">What Can You Do?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <img
              src="https://img.icons8.com/?size=100&id=fTBV7GkKahC6&format=png&color=000000"
              alt="Events"
            />
            <h3>Discover Events</h3>
            <p>
              Explore local events and join activities that match your
              interests. Never miss out on fun!
            </p>
          </div>
          <div className="feature-item">
            <img
              src="https://img.icons8.com/?size=100&id=uVHiOKL11CSm&format=png&color=000000"
              alt="Social Map"
            />
            <h3>Interactive Map</h3>
            <p>
              See what's happening around you with a real-time map of events and
              nearby users.
            </p>
          </div>
          <div className="feature-item">
            <img
              src="https://img.icons8.com/?size=100&id=13724&format=png&color=000000"
              alt="Chat"
            />
            <h3>Chat and Connect</h3>
            <p>
              Join group chats, message friends, and stay connected with the
              people that matter.
            </p>
          </div>
          <div className="feature-item">
            <img
              src="https://img.icons8.com/?size=100&id=kDoeg22e5jUY&format=png&color=000000"
              alt="Profile"
            />
            <h3>Personalize Your Profile</h3>
            <p>
              Customize your profile, manage followers, and showcase your
              interests.
            </p>
          </div>
        </div>
      </div>

      <div className="action-buttons-container">
        {!userId ? (
          <>
            <Link to="/register">
              <button className="register-button">Register</button>
            </Link>
            <Link to="/login">
              <button className="login-button">Login</button>
            </Link>
          </>
        ) : (
          <Link to="/events">
            <button className="explore-button">Explore Events</button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default HomePage;
