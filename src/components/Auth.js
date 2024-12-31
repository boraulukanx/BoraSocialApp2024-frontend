import React, { useState, useEffect } from "react";
import { register, login } from "../api/api";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = isLogin
        ? await login(formData)
        : await register(formData);

      const { user, token } = response.data;

      if (!user || !token) {
        throw new Error("Authentication failed.");
      }

      // Save token and userId
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user._id); // Ensure this matches backend `_id`

      window.location = "/home";
    } catch (err) {
      console.error("Error during authentication:", err.message || err);
      alert("Authentication failed. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </form>
        <p onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "New user? Register here."
            : "Already have an account? Login here."}
        </p>
      </div>
    </div>
  );
};

export default Auth;
