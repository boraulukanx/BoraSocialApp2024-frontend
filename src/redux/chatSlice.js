// redux/chatSlice.js
import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    privateChats: [],
    eventChats: {},
  },
  reducers: {
    setPrivateChats(state, action) {
      state.privateChats = action.payload;
    },
    addPrivateMessage(state, action) {
      const { chatId, message } = action.payload;
      const chat = state.privateChats.find((c) => c._id === chatId);
      if (chat) chat.messages.push(message);
    },
    setEventChats(state, action) {
      state.eventChats[action.payload.eventId] = action.payload.messages;
    },
    addEventMessage(state, action) {
      const { eventId, message } = action.payload;
      if (state.eventChats[eventId]) {
        state.eventChats[eventId].push(message);
      }
    },
  },
});

export const {
  setPrivateChats,
  addPrivateMessage,
  setEventChats,
  addEventMessage,
} = chatSlice.actions;
export default chatSlice.reducer;
