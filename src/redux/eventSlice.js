// redux/eventsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const eventsSlice = createSlice({
  name: "events",
  initialState: {
    eventList: [],
    selectedEvent: null,
  },
  reducers: {
    setEvents(state, action) {
      state.eventList = action.payload;
    },
    setSelectedEvent(state, action) {
      state.selectedEvent = action.payload;
    },
  },
});

export const { setEvents, setSelectedEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
