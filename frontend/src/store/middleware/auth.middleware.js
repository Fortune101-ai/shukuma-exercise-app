import { setToken, logout } from "../slices/auth.slice.js";

const AUTH_TOKEN = "auth_token";

export const authMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (setToken.match(action)) {
    const token = action.payload;
    if (token) {
      try {
        localStorage.setItem(AUTH_TOKEN, token);
      } catch (error) {
        console.error("Failed to save token to localStorage:", error);
      }
    } else {
      try {
        localStorage.removeItem(AUTH_TOKEN);
      } catch (error) {
        console.error("Failed to remove token from localStorage:", error);
      }
    }
  }

  if (logout.match(action)) {
    try {
      localStorage.removeItem(AUTH_TOKEN);
    } catch (error) {
      console.error("Failed to remove token from localStorage:", error);
    }
  }

  return result;
};

export const loadAuthToken = () => {
    try {
        const token = localStorage.getItem(AUTH_TOKEN);
        return token || null;
    } catch (error) {
        console.error("Failed to load token from localStorage:", error);
        return null;
    }
}
