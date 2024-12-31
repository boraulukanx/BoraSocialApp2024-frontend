import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFollowings } from "../api/api";
import "./FollowingsPage.css";

const FollowingsPage = () => {
  const { id } = useParams();
  const [followings, setFollowings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFollowings = async () => {
      try {
        const res = await getFollowings(id);
        setFollowings(res.data);
      } catch (err) {
        console.error("Error fetching followings:", err);
      }
    };

    fetchFollowings();
  }, [id]);

  return (
    <div className="followings-page">
      <h1 className="page-title">Followings</h1>
      {Array.isArray(followings) && followings.length > 0 ? (
        <ul className="followings-list">
          {followings.map((user) => (
            <li key={user._id} className="follow-item">
              <div
                className="follow-item-content"
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                <img
                  src={`${
                    user.profilePicture || "/uploads/default-avatar.png"
                  }`}
                  alt={user.username}
                  className="follow-avatar"
                />
                <span className="follow-username">{user.username}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-followings">No followings found.</p>
      )}
    </div>
  );
};

export default FollowingsPage;
