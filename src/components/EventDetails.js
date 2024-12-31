import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getEventDetails,
  joinEvent,
  leaveEvent,
  getParticipants,
} from "../api/api";
import ChatWindow from "./ChatWindow";
import "./EventDetails.css";

const EventDetails = ({ userId }) => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [participants, setParticipants] = useState([]);
  const navigate = useNavigate();

  // Event Icon Mapping
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

    // Add the rest of the types and subtypes here as needed
    Other: "https://img.icons8.com/ios-filled/50/other.png", // Fallback
  };

  const getEventIcon = (type, subtype) => {
    return (
      (eventIconMapping[type] && eventIconMapping[type][subtype]) ||
      eventIconMapping[type] ||
      eventIconMapping.Other
    );
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await getEventDetails(eventId);
        setEvent(res.data);
        setIsParticipant(res.data.participants.includes(userId));

        const participantsRes = await getParticipants(eventId);
        setParticipants(participantsRes.data.participants);
      } catch (err) {
        console.error("Error fetching event details:", err);
      }
    };

    fetchEventDetails();
  }, [eventId, userId]);

  const handleJoin = async () => {
    try {
      if (event.participants.length >= event.maxParticipants) {
        alert("This event has reached its maximum participant limit.");
        return;
      }

      await joinEvent(eventId, userId);
      setIsParticipant(true);

      const res = await getParticipants(eventId);
      setParticipants(res.data.participants);
    } catch (err) {
      console.error("Error joining event:", err.response?.data || err.message);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveEvent(eventId, userId);
      setIsParticipant(false);

      const eventRes = await getEventDetails(eventId);
      setEvent(eventRes.data);

      const participantsRes = await getParticipants(eventId);
      setParticipants(participantsRes.data.participants);
    } catch (err) {
      console.error("Error leaving event:", err.response?.data || err.message);
    }
  };

  const handleShowOnMap = () => {
    if (event.locationLAT && event.locationLNG) {
      navigate(`/map?lat=${event.locationLAT}&lng=${event.locationLNG}`);
    } else {
      alert("Event location is not available.");
    }
  };

  if (!event) return <p>Loading event details...</p>;

  return (
    <div className="event-details-container">
      <h2>Event Information</h2>
      <div className="event-details-content">
        {/* Event Information Section */}
        <div className="event-info-container">
          <div className="event-header">
            <img
              src={getEventIcon(event.type, event.subtype)}
              alt={event.title}
              className="event-icon"
            />
            <h1 className="event-title">{event.title}</h1>
          </div>
          <div className="event-info">
            <p>
              <span>Description:</span> {event.description}
            </p>
            <p>
              <span>Type:</span> {event.type}
            </p>
            <p>
              <span>Location:</span> {event.location}
            </p>
            <p>
              <span>Entry Fee:</span> {event.entryFee}
            </p>
            <p>
              <span>Start:</span> {new Date(event.startTime).toLocaleString()}
            </p>
            <p>
              <span>End:</span> {new Date(event.endTime).toLocaleString()}
            </p>
            <p>
              <span>Participants:</span> {participants.length}/
              {event.maxParticipants}
            </p>
          </div>
          <div className="event-actions">
            {isParticipant ? (
              <button className="action-button leave" onClick={handleLeave}>
                Leave Event
              </button>
            ) : participants.length >= event.maxParticipants ? (
              <p className="event-full">This event is full.</p>
            ) : (
              <button className="action-button join" onClick={handleJoin}>
                Join Event
              </button>
            )}
            {/* Show on Map Button */}
            <button
              className="action-button map"
              onClick={handleShowOnMap}
              style={{ backgroundColor: "#3b82f6", color: "#fff" }}
            >
              Show on Map
            </button>
          </div>
        </div>

        {/* Chat Window Section */}
        {isParticipant && (
          <div className="chat-window-container">
            <ChatWindow eventId={eventId} userId={userId} event={event} />
          </div>
        )}
      </div>

      {/* Participants Section */}
      <div className="participants-section">
        <h3>Participants</h3>
        <div className="participants-list">
          {participants.map((participant) => (
            <div
              key={participant._id}
              className="participant-card"
              onClick={() => navigate(`/profile/${participant._id}`)}
            >
              <img
                src={`${
                  participant.profilePicture ||
                  "https://via.placeholder.com/150"
                }`}
                alt={participant.username}
                className="participant-avatar"
              />
              <span>{participant.username}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
