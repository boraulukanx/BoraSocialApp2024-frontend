import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add a token to the Authorization header for secured requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// User Authentication
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);

// Event Management
export const getEvents = (userId) => API.get(`/event/user/${userId}`);
export const getEventDetails = (eventId) => API.get(`/event/${eventId}`);
export const searchEvents = (query) =>
  API.get(`/event/search?query=${encodeURIComponent(query)}`);
export const getParticipants = (eventId) =>
  API.get(`/event/${eventId}/participants`);

// Join and Leave Events
export const joinEvent = (eventId, userId) =>
  API.put(`/event/${eventId}/join`, { userId });
export const leaveEvent = (eventId, userId) =>
  API.put(`/event/${eventId}/leave`, { userId });

// Chat Management
export const sendMessage = (eventId, data) =>
  API.post(`/chat/${eventId}`, data);

export const fetchMessages = (eventId) => API.get(`/chat/${eventId}`);

// User Management
export const getUserProfile = (id) => API.get(`/user/${id}`);
export const searchUsers = (username) =>
  API.get(`/user/search?username=${encodeURIComponent(username)}`);
export const followUser = (id, userId) =>
  API.put(`/user/${id}/follow`, { userId });
export const unfollowUser = (id, userId) =>
  API.put(`/user/${id}/unfollow`, { userId });
export const updateProfilePicture = (userId, formData) =>
  API.put(`/user/${userId}/profilePicture`, formData);
export const updateUserProfile = (userId, data) =>
  API.put(`/user/${userId}/location`, data);
export const updateLocation = (location) =>
  API.put(`/user/${location.userId}/location`, {
    locationLAT: location.locationLAT,
    locationLNG: location.locationLNG,
  });

// Private Chat Management
export const getPrivateChats = (userId) =>
  API.get(`/privateChat/user/${userId}`);
export const startPrivateChat = (data) =>
  API.post("/privateChat/getOrCreate", data);

export const fetchPrivateMessages = (chatId) =>
  API.get(`/privateChat/${chatId}`);
export const sendPrivateMessage = (chatId, data) =>
  API.post(`/privateChat/${chatId}/message`, data);
export const getAvailableToChatUsers = (userId) =>
  API.get(`/privateChat/available/${userId}`);

//Map Data
export const updateUserLocation = (userId, data) =>
  API.put(`/user/${userId}/location`, data);
export const getMapData = () => API.get("/event/mapData");

//CREATE EVENT
export const createEvent = async (eventData) => {
  try {
    const response = await API.post(`/event`, eventData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err) {
    console.error("Error creating event:", err);
    throw err;
  }
};

export const getFilteredEvents = (filters) =>
  axios.post("/api/events/filter", filters);

export const getNearbyEvents = (userId, lat, lng, distance) =>
  axios.get(
    `/api/events/nearby/${userId}?lat=${lat}&lng=${lng}&distance=${distance}`
  );

export const getFollowers = (userId) => API.get(`/user/${userId}/followers`);

export const getFollowings = (userId) => API.get(`/user/${userId}/followings`);
