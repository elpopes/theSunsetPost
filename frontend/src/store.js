import { configureStore } from "@reduxjs/toolkit";
import storiesReducer from "./features/stories/storiesSlice";

export const store = configureStore({
  reducer: {
    stories: storiesReducer,
  },
});
