import React, { useState, useEffect } from "react";
import {
  getUserProfile,
  followUser,
  unfollowUser,
  updateProfilePicture,
  getEvents,
} from "../api/api";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [followers, setFollowers] = useState([]);

  const [eventsOrganized, setEventsOrganized] = useState([]); // NEW STATE

  const [eventHistory, setEventHistory] = useState([]);
  const [visibleEvents, setVisibleEvents] = useState(5);
  const [totalEvents, setTotalEvents] = useState(0);

  const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const eventIconMapping = {
    CasualHangouts: {
      CoffeeBreak:
        "https://img.icons8.com/?size=100&id=13286&format=png&color=BCAAA4",
      SmokeBreak:
        "https://img.icons8.com/?size=100&id=FFONnKCo2zcu&format=png&color=B0BEC5",
      ParkHangout:
        "https://img.icons8.com/?size=100&id=17607&format=png&color=FF9800",
      LateNightChill:
        "https://img.icons8.com/?size=100&id=zO5lgGa3WrnG&format=png&color=455A64",
      DogWalking:
        "https://img.icons8.com/?size=100&id=16018&format=png&color=B0BEC5",
      MovieNights:
        "https://img.icons8.com/?size=100&id=1eGeikx9BzTw&format=png&color=AED581",
      NeighborhoodWalk:
        "https://img.icons8.com/?size=100&id=Y0hqLZkCtY89&format=png&color=FFB74D",
    },
    Nightlife: {
      BarMeeting:
        "https://img.icons8.com/?size=100&id=Vlx7Q38Qw51G&format=png&color=6D4C41",
      PubCrawl:
        "https://img.icons8.com/?size=100&id=13300&format=png&color=FFECB3",
      Clubbing:
        "https://img.icons8.com/?size=100&id=12035&format=png&color=FFB74D",
      KaraokeNight:
        "https://img.icons8.com/?size=100&id=HfymTjyRCG1f&format=png&color=FF1D25",
      WineBarVisit:
        "https://img.icons8.com/?size=100&id=12885&format=png&color=90CAF9",
    },
    Fitness: {
      Gym: "https://img.icons8.com/?size=100&id=16887&format=png&color=90A4AE",
      Yoga: "https://img.icons8.com/?size=100&id=16959&format=png&color=BA68C8",
      Pilates:
        "https://img.icons8.com/?size=100&id=16946&format=png&color=FF754C",
      Calisthenics:
        "https://img.icons8.com/?size=100&id=G85vV5YEwXZ9&format=png&color=546E7A",
      MartialArts:
        "https://img.icons8.com/?size=100&id=33497&format=png&color=FFBA57",
    },
    Socializing: {
      MeetupGroup:
        "https://img.icons8.com/?size=100&id=14804&format=png&color=8BC34A",
      SpeedDating:
        "https://img.icons8.com/?size=100&id=13030&format=png&color=B71C1C",
      Networking:
        "https://img.icons8.com/?size=100&id=qRw39Ga7doP7&format=png&color=5994EF",
      DiscussionCircle:
        "https://img.icons8.com/?size=100&id=103407&format=png&color=2196F3",
      Volunteering:
        "https://img.icons8.com/?size=100&id=17677&format=png&color=FFCC80",
      CulturalEvents:
        "https://img.icons8.com/?size=100&id=CfBOZAcSalzN&format=png&color=FFC233",
    },
    Sports: {
      Football:
        "https://img.icons8.com/?size=100&id=84301&format=png&color=E0DDDC",
      Basketball:
        "https://img.icons8.com/?size=100&id=12969&format=png&color=FF754C",
      Tennis:
        "https://img.icons8.com/?size=100&id=32409&format=png&color=C6FF00",
      Volleyball:
        "https://img.icons8.com/?size=100&id=16960&format=png&color=ECEFF1",
      Cricket:
        "https://img.icons8.com/?size=100&id=12982&format=png&color=E64A19",
      Badminton:
        "https://img.icons8.com/?size=100&id=24315&format=png&color=FF754C",
      Swimming:
        "https://img.icons8.com/?size=100&id=3RqBtklFoAjG&format=png&color=FFAA45",
      Running:
        "https://img.icons8.com/?size=100&id=33504&format=png&color=FFBA57",
      Cycling:
        "https://img.icons8.com/?size=100&id=33516&format=png&color=607D8B",
    },
    Music: {
      Rock: "https://img.icons8.com/?size=100&id=13142&format=png&color=F44336",
      Jazz: "https://img.icons8.com/?size=100&id=12807&format=png&color=FFC107",
      Classical:
        "https://img.icons8.com/?size=100&id=12789&format=png&color=CFD8DC",
      Pop: "https://img.icons8.com/?size=100&id=31561&format=png&color=F44336",
      EDM: "https://img.icons8.com/?size=100&id=12100&format=png&color=455A64",
      HipHop:
        "https://img.icons8.com/?size=100&id=12227&format=png&color=3F51B5",
      Country:
        "https://img.icons8.com/?size=100&id=11923&format=png&color=FFC107",
      Metal:
        "https://img.icons8.com/?size=100&id=12373&format=png&color=FFA726",
    },
    Outdoors: {
      Hiking:
        "https://img.icons8.com/?size=100&id=ITrZVe1j5RGr&format=png&color=E89531",
      Camping:
        "https://img.icons8.com/?size=100&id=17576&format=png&color=FFC107",
      Fishing:
        "https://img.icons8.com/?size=100&id=25077&format=png&color=616161",
      RockClimbing:
        "https://img.icons8.com/?size=100&id=1QgNSsmTwsWx&format=png&color=E89531",
      Surfing:
        "https://img.icons8.com/?size=100&id=16964&format=png&color=E64A19",
      Kayaking:
        "https://img.icons8.com/?size=100&id=HuNbizd8eIcv&format=png&color=FFAA45",
      Sailing:
        "https://img.icons8.com/?size=100&id=33491&format=png&color=90A4AE",
      Skiing:
        "https://img.icons8.com/?size=100&id=16931&format=png&color=455A64",
      Snowboarding:
        "https://img.icons8.com/?size=100&id=IkIKhaPldPSD&format=png&color=455A64",
    },
    Gaming: {
      ComputerGames:
        "https://img.icons8.com/?size=100&id=XfjNd4vkhBBy&format=png&color=5D4037",
      BoardGames:
        "https://img.icons8.com/?size=100&id=16450&format=png&color=FFCA28",
      VideoGames:
        "https://img.icons8.com/?size=100&id=11907&format=png&color=546E7A",
      CardGames:
        "https://img.icons8.com/?size=100&id=16427&format=png&color=CFD8DC",
    },
    FoodAndDrink: {
      CookingClass:
        "https://img.icons8.com/?size=100&id=Bao85O4hGewf&format=png&color=37474F",
      VeganFestival:
        "https://img.icons8.com/?size=100&id=20875&format=png&color=8BC34A",
      CocktailMaking:
        "https://img.icons8.com/?size=100&id=12863&format=png&color=FFEB3B",
      Baking:
        "https://img.icons8.com/?size=100&id=prMPVJSDTYny&format=png&color=3E2723",
    },
    Art: {
      Painting:
        "https://img.icons8.com/?size=100&id=Xwqu8cUREfko&format=png&color=FFC107",
      Photography:
        "https://img.icons8.com/?size=100&id=11896&format=png&color=607D8B",
      FilmMaking:
        "https://img.icons8.com/?size=100&id=20848&format=png&color=607D8B",
      StreetArt:
        "https://img.icons8.com/?size=100&id=zC2UCN6v1en1&format=png&color=E65100",
    },
  };

  const getEventIcon = (type, subtype) => {
    return (
      (eventIconMapping[type] && eventIconMapping[type][subtype]) ||
      eventIconMapping[type] ||
      eventIconMapping.Other
    );
  };

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile(id);
        setUser(res.data);
        setIsFollowing(res.data.followers.includes(userId));

        const eventsRes = await getEvents(id);

        // Filter events the user has participated in or is currently participating
        const userEvents = eventsRes.data.filter((event) =>
          event.participants.includes(id)
        );

        // Sort events by date (upcoming first)
        const sortedEvents = userEvents.sort(
          (a, b) => new Date(a.startTime) - new Date(b.startTime)
        );

        setEventHistory(sortedEvents); // Set both participated and participating events
        setTotalEvents(userEvents.length);

        // Separate events organized by the user
        const organizedEvents = userEvents.filter(
          (event) => event.organizer === id
        );
        setEventsOrganized(organizedEvents);
      } catch (err) {
        console.error("Error fetching profile or events:", err);
      }
    };
    fetchProfile();
  }, [id, userId]);

  const handleFollow = async () => {
    try {
      await followUser(id, userId);
      setIsFollowing(true);
    } catch (err) {
      console.error("Error following user:", err.message);
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowUser(id, userId);
      setIsFollowing(false);
    } catch (err) {
      console.error("Error unfollowing user:", err.message);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  /*const handleProfilePictureUpdate = async () => {
    if (!selectedFile) return alert("Please select a file first.");
    const formData = new FormData();
    formData.append("profilePicture", selectedFile);
    formData.append("userId", userId);

    try {
      const res = await updateProfilePicture(id, formData);
      setUser(res.data);
      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error("Error updating profile picture:", err);
      alert("Failed to update profile picture.");
    }
  };*/

  const handleProfilePictureUpdate = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", selectedFile);
    formData.append("userId", userId);

    try {
      const response = await fetch(`${baseURL}/user/${id}/profilePicture`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = `Failed with status ${response.status}`;
        console.error(errorMessage);
        alert(errorMessage);
        return;
      }

      const data = await response.json();
      setUser(data.updatedUser); // Update user profile
      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error("Error updating profile picture:", err);
      alert("An error occurred while updating your profile picture.");
    }
  };

  const loadMoreEvents = () => {
    setVisibleEvents((prev) => prev + 5);
  };

  if (!user) return <p>Loading profile...</p>;
  return (
    <div className="profile-page">
      <h1>{user.username}'s Profile</h1>
      <div className="top-sections">
        {/* User Profile Section */}
        <div className="profile-section">
          <img
            src={`${user.profilePicture || "/default.png"}`}
            alt="Profile"
            className="profile-picture"
          />
          <h1>{user.username}</h1>
          <p
            className="p-followers"
            onClick={() => navigate(`/${id}/followers`)}
          >
            Followers: {user.followers.length}
          </p>
          <p
            className="p-followings"
            onClick={() => navigate(`/${id}/followings`)}
          >
            Following: {user.following.length}
          </p>
          {id !== userId ? (
            <button
              onClick={isFollowing ? handleUnfollow : handleFollow}
              className={`follow-button ${isFollowing ? "unfollow" : ""}`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          ) : (
            <div className="update-picture">
              <input type="file" onChange={handleFileChange} />
              <button
                onClick={handleProfilePictureUpdate}
                className="update-picture-button"
              >
                Update Picture
              </button>
            </div>
          )}
        </div>

        {/* Events Created Section */}
        <div className="events-created-section">
          <h2>Events Created</h2>
          {eventHistory.filter((event) => event.organizer === id).length > 0 ? (
            <ul className="events-created-list">
              {eventHistory
                .filter((event) => event.organizer === id) // Only events created by the shown user
                .map((event) => (
                  <Link to={`/event/${event._id}`} key={event._id}>
                    <li className="events-created-item">
                      <img
                        src={getEventIcon(event.type, event.subtype)}
                        alt={event.title}
                        className="event-icon"
                      />
                      <div className="event-info">
                        <p className="event-title">{event.title}</p>
                        <p>
                          Start: {new Date(event.startTime).toLocaleString()}
                        </p>
                        <p>End: {new Date(event.endTime).toLocaleString()}</p>
                      </div>
                    </li>
                  </Link>
                ))}
            </ul>
          ) : (
            <p>No events created yet.</p>
          )}
        </div>
      </div>

      {/* Event History Section */}
      <div className="event-section">
        <h2>Event History</h2>
        {eventHistory.length === 0 ? (
          <p>No events found for this user.</p>
        ) : (
          <ul className="event-list">
            {eventHistory.slice(0, visibleEvents).map((event) => (
              <Link to={`/event/${event._id}`} key={event._id}>
                <li className="event-item">
                  <img
                    src={getEventIcon(event.type, event.subtype)}
                    alt={event.title}
                    className="event-icon"
                  />
                  <div className="event-details">
                    <p className="event-title">{event.title}</p>
                    <p>Type: {event.type}</p>
                    <p>Start: {new Date(event.startTime).toLocaleString()}</p>
                    <p>End: {new Date(event.endTime).toLocaleString()}</p>
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        )}
        {totalEvents > visibleEvents && (
          <button className="load-more" onClick={loadMoreEvents}>
            See All Events
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
