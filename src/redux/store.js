// store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import eventsReducer from "./eventSlice";
import chatReducer from "./chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    chat: chatReducer,
  },
});
