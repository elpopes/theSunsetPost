import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch stories from backend API
export const fetchStories = createAsyncThunk(
  "stories/fetchStories",
  async () => {
    const response = await fetch("http://localhost:3000/api/stories");
    return response.json();
  }
);

// Stories slice
const storiesSlice = createSlice({
  name: "stories",
  initialState: {
    items: [], // Array to hold fetched stories
    status: "idle", // Status to track API request state ('idle', 'loading', 'succeeded', 'failed')
    error: null, // To capture any errors during the fetch process
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchStories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload; // Store the fetched stories in the state
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default storiesSlice.reducer;
