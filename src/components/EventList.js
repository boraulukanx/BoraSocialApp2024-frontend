import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getEvents } from "../api/api";
import "./EventList.css";

const EventList = ({ userId }) => {
  const [events, setEvents] = useState([]);
  const [activeSearchTerm, setActiveSearchTerm] = useState(""); // Search for Active Events
  const [allSearchTerm, setAllSearchTerm] = useState(""); // Search for All Events
  const [filterType, setFilterType] = useState("All"); // Filter by type
  const [sortOption, setSortOption] = useState("date"); // Sorting option
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getEvents(userId);
        const eventsWithValidatedDistances = res.data.map((event) => ({
          ...event,
          distance:
            event.distance !== undefined && !isNaN(event.distance)
              ? event.distance
              : null, // Ensure valid distance
        }));
        setEvents(eventsWithValidatedDistances); // Set events with valid distances
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, [userId]);

  // Active Events: Start time is in the future
  const activeEvents = events.filter(
    (event) => new Date(event.startTime) > new Date()
  );

  // Filter and sort events
  const filterAndSortEvents = (eventList, searchTerm) => {
    return eventList
      .filter((event) => {
        if (filterType !== "All" && event.type !== filterType) return false;
        if (!event.title.toLowerCase().includes(searchTerm.toLowerCase()))
          return false;
        return true;
      })
      .sort((a, b) => {
        if (sortOption === "date")
          return new Date(a.startTime) - new Date(b.startTime);
        if (sortOption === "name") return a.title.localeCompare(b.title);
        if (sortOption === "distance") {
          if (a.distance === null) return 1; // Push invalid distances to end
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        }
        return 0;
      });
  };

  const filteredActiveEvents = filterAndSortEvents(
    activeEvents,
    activeSearchTerm
  );

  const filteredAllEvents = filterAndSortEvents(events, allSearchTerm);

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

  const getEventIcon = (type, subtype) => {
    return (
      (eventIconMapping[type] && eventIconMapping[type][subtype]) ||
      eventIconMapping[type] ||
      eventIconMapping.Other
    );
  };

  return (
    <div className="event-list-container">
      {/* Filter and Sort Controls */}
      <div className="filter-sort-section">
        <h2>Filter and Sort Events</h2>
        <div className="filter-controls">
          {/* Filter by Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Types</option>
            <option value="CasualHangouts">Casual Hangouts</option>
            <option value="Nightlife">Nightlife</option>
            <option value="Fitness">Fitness</option>
            <option value="Socializing">Socializing</option>
            <option value="Sports">Sports</option>
            <option value="Music">Music</option>
            <option value="Outdoors">Outdoors</option>
            <option value="Gaming">Gaming</option>
            <option value="FoodAndDrink">Food & Drink</option>
            <option value="Art">Art</option>
          </select>

          {/* Sort Options */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="filter-select"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="distance">Sort by Distance</option>
          </select>
        </div>
      </div>

      {/* Active Events Section */}
      <div className="active-events">
        <h2>Active Events</h2>
        <input
          type="text"
          placeholder="Search active events..."
          value={activeSearchTerm}
          onChange={(e) => setActiveSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="event-row">
          {filteredActiveEvents.length > 0 ? (
            filteredActiveEvents.map((event) => (
              <div
                key={event._id}
                className="event-item"
                onClick={() => navigate(`/event/${event._id}`)}
              >
                <img
                  src={getEventIcon(event.type, event.subtype)}
                  alt={event.title}
                  className="event-icon"
                />
                <div className="event-details">
                  <h3>{event.title}</h3>
                  <p>Type: {event.type}</p>
                  <p className="distance">
                    Distance:{" "}
                    {event.distance ? `${event.distance.toFixed(2)} km` : "N/A"}
                  </p>
                  <p>
                    Start: {new Date(event.startTime).toLocaleDateString()}{" "}
                    {new Date(event.startTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No active events found.</p>
          )}
        </div>
      </div>

      {/* All Events Section */}
      <div className="all-events">
        <h2>All Events</h2>
        <input
          type="text"
          placeholder="Search all events..."
          value={allSearchTerm}
          onChange={(e) => setAllSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="event-row">
          {filteredAllEvents.length > 0 ? (
            filteredAllEvents.map((event) => (
              <div
                key={event._id}
                className="event-item"
                onClick={() => navigate(`/event/${event._id}`)}
              >
                <img
                  src={getEventIcon(event.type, event.subtype)}
                  alt={event.title}
                  className="event-icon"
                />
                <div className="event-details">
                  <h3>{event.title}</h3>
                  <p>Type: {event.type}</p>
                  <p className="distance">
                    Distance:{" "}
                    {event.distance ? `${event.distance.toFixed(2)} km` : "N/A"}
                  </p>

                  <p>
                    Start: {new Date(event.startTime).toLocaleDateString()}{" "}
                    {new Date(event.startTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No events found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventList;
