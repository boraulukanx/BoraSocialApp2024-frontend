import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFollowers } from "../api/api";
import "./FollowersPage.css";

const FollowersPage = () => {
  const { id } = useParams();
  const [followers, setFollowers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await getFollowers(id);
        setFollowers(res.data);
      } catch (err) {
        console.error("Error fetching followers:", err);
      }
    };

    fetchFollowers();
  }, [id]);

  return (
    <div className="followers-page">
      <h1 className="page-title">Followers</h1>
      {Array.isArray(followers) && followers.length > 0 ? (
        <ul className="followers-list">
          {followers.map((user) => (
            <li key={user._id} className="follower-item">
              <div
                className="follower-item-content"
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                <img
                  src={`${
                    user.profilePicture || "/uploads/default-avatar.png"
                  }`}
                  alt={user.username}
                  className="follower-avatar"
                />
                <span className="follower-username">{user.username}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-followers">No followers found.</p>
      )}
    </div>
  );
};

export default FollowersPage;
