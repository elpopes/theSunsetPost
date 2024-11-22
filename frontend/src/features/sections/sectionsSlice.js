import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch all sections
export const fetchSections = createAsyncThunk(
  "sections/fetchSections",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:3000/api/sections");
      if (!response.ok) {
        throw new Error("Failed to fetch sections");
      }
      return await response.json(); // Assuming API returns an array of sections
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch a single section
export const fetchSectionById = createAsyncThunk(
  "sections/fetchSectionById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3000/api/sections/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch section with ID: ${id}`);
      }
      return await response.json(); // Assuming API returns a single section object
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const sectionsSlice = createSlice({
  name: "sections",
  initialState: {
    items: [], // List of all sections
    currentSection: null, // Single section for `SectionDetail`
    status: "idle", // loading, succeeded, failed
    error: null, // Error message
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchSections
      .addCase(fetchSections.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload; // Set fetched sections
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Handle fetchSectionById
      .addCase(fetchSectionById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSectionById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentSection = action.payload; // Set the current section
      })
      .addCase(fetchSectionById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default sectionsSlice.reducer;
