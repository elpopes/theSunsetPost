import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseURL } from "../../config";

// Async thunk to fetch all sections
export const fetchSections = createAsyncThunk(
  "sections/fetchSections",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const currentLanguage = state.i18n?.language || "en";

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

// Async thunk to fetch a single section by name
export const fetchSectionByName = createAsyncThunk(
  "sections/fetchSectionByName",
  async (name, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseURL}/api/sections/name/${name}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch section with name: ${name}`);
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const sectionsSlice = createSlice({
  name: "sections",
  initialState: {
    items: [],
    currentSection: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSections.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchSectionByName.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSectionByName.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentSection = action.payload;
      })
      .addCase(fetchSectionByName.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default sectionsSlice.reducer;
