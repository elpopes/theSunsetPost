import { configureStore } from "@reduxjs/toolkit";
import storiesReducer from "./features/stories/storiesSlice";
import authReducer from "./features/auth/authSlice";
import sectionsReducer from "./features/sections/sectionsSlice";
import classifiedsReducer from "./features/classifieds/classifiedsSlice";

export const store = configureStore({
  reducer: {
    stories: storiesReducer,
    auth: authReducer,
    sections: sectionsReducer,
    classfieds: classifiedsReducer,
  },
});
