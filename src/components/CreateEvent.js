import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createEvent } from "../api/api";
import { useNavigate } from "react-router-dom";
import { createEventIcon, eventIconMapping } from "../utils/iconUtils"; // Import shared utilities
import L from "leaflet";
import "./CreateEvent.css";

const CreateEvent = ({ userId }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [subtype, setSubtype] = useState("");
  const [location, setLocation] = useState("");
  const [entryFee, setEntryFee] = useState(0);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(0);

  const [locationLAT, setLocationLAT] = useState(null);
  const [locationLNG, setLocationLNG] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [availableSubtypes, setAvailableSubtypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => console.error("Error fetching location:", error),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setType(selectedType);

    // Check if the selected type has subtypes and set them
    const subtypes =
      eventIconMapping[selectedType] &&
      typeof eventIconMapping[selectedType] === "object"
        ? Object.keys(eventIconMapping[selectedType])
        : [];
    setAvailableSubtypes(subtypes);
    setSubtype(""); // Reset subtype
  };

  const validateInputs = () => {
    if (
      !title ||
      !type ||
      !startTime ||
      !endTime ||
      !locationLAT ||
      !locationLNG
    ) {
      setErrorMessage(
        "All required fields must be filled, and a location must be selected."
      );
      return false;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      setErrorMessage("Start time must be before end time.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return;

    setLoading(true);
    setErrorMessage("");

    const eventData = {
      title,
      description,
      type,
      subtype,
      location,
      entryFee,
      startTime,
      endTime,
      maxParticipants,
      locationLAT,
      locationLNG,
      organizer: userId,
    };

    try {
      const createdEvent = await createEvent(eventData);
      alert("Event created successfully!");
      navigate(`/event/${createdEvent._id}`);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setLocationLAT(e.latlng.lat);
        setLocationLNG(e.latlng.lng);
      },
    });
    return locationLAT && locationLNG ? (
      <Marker position={[locationLAT, locationLNG]} />
    ) : null;
  };

  return (
    <div className="create-event-container">
      <div className="create-event-header">
        <h1>Create New Event</h1>
      </div>
      <form className="create-event-form" onSubmit={handleSubmit}>
        {errorMessage && (
          <div className="create-event-error">{errorMessage}</div>
        )}

        <label>
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Type:
          <select value={type} onChange={handleTypeChange} required>
            <option value="">Select Type</option>
            {Object.keys(eventIconMapping).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </label>

        {availableSubtypes.length > 0 ? (
          <label>
            Subtype:
            <select
              value={subtype}
              onChange={(e) => setSubtype(e.target.value)}
            >
              <option value="">Select Subtype</option>
              {availableSubtypes.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </label>
        ) : type === "Other" ? (
          <p>No subtypes available for "Other".</p>
        ) : null}

        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label>
          Location:
          <textarea
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>

        <div className="create-event-row">
          <div className="create-event-row-half">
            <label>
              Entry Fee:
              <input
                type="number"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
              />
            </label>
          </div>
          <div className="create-event-row-half">
            <label>
              Max Participants:
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                required
              />
            </label>
          </div>
        </div>

        <div className="create-event-row">
          <div className="create-event-row-half">
            <label>
              Start Time:
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="create-event-row-half">
            <label>
              End Time:
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </label>
          </div>
        </div>

        <div className="create-event-map-section">
          <h2>Select Event Location</h2>
          {userLocation && (
            <MapContainer
              center={userLocation}
              zoom={13}
              className="create-event-map-container"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapClickHandler />
            </MapContainer>
          )}
          {locationLAT && locationLNG && (
            <p className="create-event-map-info">
              Selected Location: LAT={locationLAT}, LNG={locationLNG}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="create-event-button"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
