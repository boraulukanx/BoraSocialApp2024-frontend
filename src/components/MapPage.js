import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  getMapData,
  updateLocation,
  searchUsers,
  searchEvents,
} from "../api/api";
import { useNavigate, useLocation } from "react-router-dom";
import "./MapPage.css";

// Fix marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ZoomHandler Component to Handle Zoom Logic
const ZoomHandler = ({ position, zoomLevel }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, zoomLevel); // Zoom in or out
    }
    const currentZoom = map.getZoom(); // Get current zoom level
    if (currentZoom > zoomLevel) {
      map.flyTo(position, zoomLevel); // Fly to position with controlled zoom level
    } else {
      map.flyTo(position); // Fly to position without zoom changes
    }
  }, [position, zoomLevel, map]);

  return null;
};

// Custom component to set map view
const SetMapView = ({ position, zoomLevel }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, zoomLevel);
    }
  }, [position, zoomLevel, map]);

  return null;
};

const MapPage = () => {
  const mapRef = useRef(null); // Ref for map instance

  const [mapData, setMapData] = useState({ users: [], events: [] });
  const [userLocation, setUserLocation] = useState(null); // User's initial location
  const [focusedPosition, setFocusedPosition] = useState(null); // Track the focused position
  const [defaultZoom] = useState(15); // Default zoom level

  const [userSearchResults, setUserSearchResults] = useState([]);
  const [eventSearchResults, setEventSearchResults] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [eventSearchTerm, setEventSearchTerm] = useState("");

  const [eventLocation, setEventLocation] = useState(null); // Specific event location
  const [zoomLevel, setZoomLevel] = useState(15); // Default zoom level
  const location = useLocation();

  const handlePopupClose = () => {
    if (mapRef.current) {
      mapRef.current.setView(focusedPosition, defaultZoom, {
        animate: true,
      });
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (deg) => deg * (Math.PI / 180);
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  const nearbyUsers = mapData.users
    .map((user) => {
      if (!user.locationLAT || !user.locationLNG || !userLocation) return null;
      const distance = calculateDistance(
        userLocation[0],
        userLocation[1],
        user.locationLAT,
        user.locationLNG
      );
      return { ...user, distance };
    })
    .filter((user) => user && user.distance <= 10);

  const nearbyEvents = mapData.events
    .map((event) => {
      if (!event.locationLAT || !event.locationLNG || !userLocation)
        return null;
      const distance = calculateDistance(
        userLocation[0],
        userLocation[1],
        event.locationLAT,
        event.locationLNG
      );
      return { ...event, distance };
    })
    .filter((event) => event && event.distance <= 10);

  const orderedNearbyUsers = nearbyUsers
    .map((user) => ({
      ...user,
      distance: calculateDistance(userLocation, {
        lat: user.lat,
        lng: user.lng,
      }),
    }))
    .sort((a, b) => a.distance - b.distance); // Sort by closest distance

  const orderedNearbyEvents = nearbyEvents
    .map((event) => ({
      ...event,
      distance: calculateDistance(userLocation, {
        lat: event.lat,
        lng: event.lng,
      }),
    }))
    .sort((a, b) => a.distance - b.distance); // Sort by closest distance

  // Fetch map data
  const fetchMapData = async () => {
    try {
      const res = await getMapData();
      console.log("Fetched Map Data:", res.data);
      setMapData(res.data); // Store users and events in state
    } catch (err) {
      console.error("Error fetching map data:", err.response || err.message);
    }
  };

  const navigate = useNavigate();

  // Real-time location updates and map initialization
  useEffect(() => {
    const fetchLocationAndMapData = async () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("User's initial location:", [latitude, longitude]);
          setUserLocation([latitude, longitude]);

          // Send location to the backend
          const location = {
            userId: localStorage.getItem("userId"),
            locationLAT: latitude,
            locationLNG: longitude,
          };

          updateLocation(location)
            .then(() => console.log("Location updated successfully"))
            .catch((err) => console.error("Error updating location:", err));
        },
        (error) => {
          console.error("Geolocation error:", error);
          setUserLocation([51.505, -0.09]); // Default to London if geolocation fails
        },
        { enableHighAccuracy: true }
      );

      // Fetch map data
      await fetchMapData();
    };

    fetchLocationAndMapData();
  }, []);

  // Parse query parameters from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const lat = queryParams.get("lat");
    const lng = queryParams.get("lng");

    if (lat && lng) {
      setEventLocation([parseFloat(lat), parseFloat(lng)]);
      setZoomLevel(18); // Increase zoom level for focusing on the event
    }
  }, [location]);

  const handleUserSearch = async (term) => {
    if (!term.trim()) {
      setUserSearchResults([]);
      return;
    }
    try {
      const res = await searchUsers(term);
      setUserSearchResults(res.data);
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  const handleEventSearch = async (term) => {
    if (!term.trim()) {
      setEventSearchResults([]);
      return;
    }
    try {
      const res = await searchEvents(term);
      setEventSearchResults(res.data);
    } catch (err) {
      console.error("Error searching events:", err);
    }
  };

  // Helper function to create user-specific icons
  const createUserIcon = (profilePicture) => {
    return L.icon({
      iconUrl: profilePicture || "https://via.placeholder.com/50",
      iconSize: [50, 50], // Icon size matches the profile picture
      className: "custom-user-icon",
      iconAnchor: [25, 50], // Center the icon properly
    });
  };

  const getEventIcon = (type, subtype) => {
    return (
      (eventIconMapping[type] && eventIconMapping[type][subtype]) ||
      eventIconMapping[type] ||
      eventIconMapping.Other
    );
  };

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

    Other: "https://img.icons8.com/ios-filled/50/other.png", // General fallback
  };
  // Helper function to create event-specific icons
  const createEventIcon = (type, subtype) => {
    let iconUrl = null;

    // Determine icon URL based on type and subtype
    if (eventIconMapping[type]) {
      if (eventIconMapping[type][subtype]) {
        iconUrl = eventIconMapping[type][subtype];
      } else {
        iconUrl = eventIconMapping[type];
      }
    }

    // Fallback icon
    if (!iconUrl || typeof iconUrl !== "string") {
      iconUrl = "https://img.icons8.com/ios-filled/50/000000/marker.png"; // Fallback icon
    }

    console.log("Final Event Icon URL:", iconUrl);

    // Create a circular background for the icon
    return L.divIcon({
      className: "custom-event-icon", // Add this for CSS styling
      html: `
        <div style="
          width: 50px;
          height: 50px;
          background-color: white;
          border: 2px solid #000;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 2px 4px 6px rgba(0, 0, 0, 0.3);
        ">
          <img src="${iconUrl}" alt="Event Icon" style="width: 30px; height: 30px; border-radius: 50%;" />
        </div>
      `,
      iconSize: [50, 50], // Size of the icon container
      iconAnchor: [25, 50], // Anchor point for positioning
      popupAnchor: [0, -40], // Position of the popup relative to the icon
    });
  };
  if (!userLocation) return <p>Loading map...</p>;

  return (
    <div>
      <h2>Social Map</h2>
      <MapContainer
        center={userLocation} // Center map on user's initial location
        zoom={defaultZoom}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Focus on the specific event location if provided */}
        {eventLocation && (
          <SetMapView position={eventLocation} zoomLevel={18} />
        )}

        {/* Handle zoom logic dynamically */}
        {focusedPosition && (
          <ZoomHandler position={focusedPosition} zoomLevel={18} />
        )}

        {/* User's own location marker */}
        {/*<Marker position={userLocation}>
          <Popup>You are here!</Popup>
        </Marker>*/}

        {/* Render user markers */}
        {mapData.users.map((user) => {
          if (!user.locationLAT || !user.locationLNG) {
            console.warn("Skipping user due to missing location:", user);
            return null;
          }
          const userPosition = [user.locationLAT, user.locationLNG];
          return (
            <Marker
              key={user._id}
              position={userPosition}
              icon={createUserIcon(`${user.profilePicture}`)}
              eventHandlers={{
                click: () => setFocusedPosition(userPosition), // Zoom in on user marker
                popupclose: () => setFocusedPosition(null), // Reset zoom on popup close
              }}
            >
              <Popup>
                <div
                  style={{
                    textAlign: "center",
                    color: "#e0e0e0",
                    padding: "10px",
                  }}
                >
                  <strong style={{ color: "#ffcc00" }}>{user.username}</strong>
                  <br />
                  <img
                    src={`${
                      user.profilePicture || "https://via.placeholder.com/150"
                    }`}
                    alt={user.username}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      border: "2px solid #ffcc00",
                      marginTop: "10px",
                    }}
                  />
                  <br />
                  <button
                    style={{
                      marginTop: "10px",
                      padding: "5px 10px",
                      backgroundColor: "#3b82f6",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/profile/${user._id}`)}
                  >
                    Go to Profile
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render event markers */}
        {mapData.events.map((event) => {
          console.log(
            "Event Type:",
            event.type,
            "Event Subtype:",
            event.subtype
          );
          if (!event.locationLAT || !event.locationLNG) {
            console.warn("Skipping event due to missing location:", event);
            return null; // Skip invalid locations
          }
          const eventPosition = [event.locationLAT, event.locationLNG];
          return (
            <Marker
              key={event._id}
              position={eventPosition}
              icon={createEventIcon(event.type, event.subtype)} // Ensure icon creation
              eventHandlers={{
                click: () => setFocusedPosition(eventPosition), // Zoom in on event marker
                popupclose: () => setFocusedPosition(null), // Reset zoom on popup close
              }}
            >
              <Popup>
                <div
                  style={{
                    textAlign: "center",
                    color: "#e0e0e0",
                    padding: "10px",
                  }}
                >
                  <strong style={{ color: "#ffcc00" }}>{event.title}</strong>
                  <br />
                  <em style={{ color: "#f9a825" }}>{event.type}</em>
                  {event.subtype && (
                    <span style={{ color: "#f9a825" }}> ({event.subtype})</span>
                  )}
                  <br />
                  <p style={{ marginTop: "10px" }}>{event.location}</p>
                  <button
                    style={{
                      marginTop: "10px",
                      padding: "5px 10px",
                      backgroundColor: "#3b82f6",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/event/${event._id}`)}
                  >
                    Event Page
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      {/* Search Section */}
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Users..."
            value={userSearchTerm}
            onChange={(e) => {
              setUserSearchTerm(e.target.value);
              handleUserSearch(e.target.value);
            }}
          />
          {userSearchResults.length > 0 && (
            <ul className="search-results">
              {userSearchResults.map((user) => (
                <li
                  key={user._id}
                  onClick={() => navigate(`/profile/${user._id}`)}
                >
                  <img
                    src={`${user.profilePicture || "/default.png"}`}
                    alt={user.username}
                    className="search-results-avatar"
                  />
                  {user.username}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Events..."
            value={eventSearchTerm}
            onChange={(e) => {
              setEventSearchTerm(e.target.value);
              handleEventSearch(e.target.value);
            }}
          />
          {eventSearchResults.length > 0 && (
            <ul className="search-results">
              {eventSearchResults.map((event) => (
                <li
                  key={event._id}
                  onClick={() => navigate(`/event/${event._id}`)}
                >
                  <img
                    className="search-results-avatar"
                    src={
                      getEventIcon(event.type, event.subtype) ||
                      "https://via.placeholder.com/50"
                    }
                    alt={event.title}
                    style={{}}
                  />
                  {event.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="lists-container">
        <div className="list">
          <h2>Nearby Users</h2>
          {nearbyUsers.length ? (
            <ul>
              {nearbyUsers.map((user) => (
                <li
                  key={user._id}
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="list-item"
                >
                  <img
                    src={`${user.profilePicture || "/default.png"}`}
                    alt={user.username}
                    className="avatar"
                  />
                  <span>{user.username}</span>- {user.distance.toFixed(2)} km
                </li>
              ))}
            </ul>
          ) : (
            <p>No nearby users found.</p>
          )}
        </div>
        <div className="list">
          <h2>Nearby Events</h2>
          {nearbyEvents.length ? (
            <ul>
              {nearbyEvents.map((event) => (
                <li
                  key={event._id}
                  onClick={() => navigate(`/event/${event._id}`)}
                  className="list-item"
                >
                  <img
                    className="avatar"
                    src={
                      getEventIcon(event.type, event.subtype) ||
                      "https://via.placeholder.com/50"
                    }
                    alt={event.title}
                    style={{}}
                  />
                  <span>{event.title}</span>- {event.distance.toFixed(2)} km
                </li>
              ))}
            </ul>
          ) : (
            <p>No nearby events found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
