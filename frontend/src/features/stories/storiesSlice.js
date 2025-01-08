import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch stories
export const fetchStories = createAsyncThunk(
  "stories/fetchStories",
  async () => {
    const response = await fetch("http://localhost:3000/api/stories");
    return response.json();
  }
);

// Async thunk to delete a story
export const deleteStory = createAsyncThunk(
  "stories/deleteStory",
  async ({ storyId, token }) => {
    const response = await fetch(
      `http://localhost:3000/api/stories/${storyId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to delete story");
    return storyId; // Return the ID of the deleted story
  }
);

// Async thunk to edit a story
export const editStory = createAsyncThunk(
  "stories/editStory",
  async ({ storyId, translations, image, token }) => {
    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("translations", JSON.stringify(translations));

    const response = await fetch(
      `http://localhost:3000/api/stories/${storyId}`,
      {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to edit story");
    return response.json(); // Return the updated story
  }
);

// Stories slice
const storiesSlice = createSlice({
  name: "stories",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (story) => story.id !== action.payload
        );
      })
      .addCase(editStory.fulfilled, (state, action) => {
        const updatedStory = action.payload;
        const index = state.items.findIndex(
          (story) => story.id === updatedStory.id
        );
        if (index !== -1) {
          state.items[index] = updatedStory;
        }
      });
  },
});

export default storiesSlice.reducer;
