import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseURL } from "../../config";

// Async thunk to fetch all sections
export const fetchSections = createAsyncThunk(
  "sections/fetchSections",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const currentLanguage = state.i18n?.language || "en"; // Default to English

    try {
      const response = await fetch(
        `${baseURL}/api/sections?locale=${currentLanguage}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch a single section by ID
export const fetchSectionById = createAsyncThunk(
  "sections/fetchSectionById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseURL}/api/sections/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch section with ID: ${id}`);
      }
      return await response.json(); // Fetch a single section with stories
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const sectionsSlice = createSlice({
  name: "sections",
  initialState: {
    items: [], // Array of all sections with translations
    currentSection: null, // Data for a single section
    status: "idle", // Status to track API request state
    error: null, // Capture any errors during the fetch
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
        state.items = action.payload; // Store all fetched sections
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
        state.currentSection = action.payload; // Store the current section data
      })
      .addCase(fetchSectionById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default sectionsSlice.reducer;
