import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice.js";
import { authMiddleware } from "./middleware/auth.middleware.js";

export default configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: ["auth/setToken"],
      },
    }).concat(authMiddleware),
});
