import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import store from "./store/store.js";
import { setToken } from "./store/slices/auth.slice.js";
import { loadAuthToken } from "./store/middleware/auth.middleware.js";

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = loadAuthToken();
    if (token) {
      dispatch(setToken(token));
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ padding: "20px" }}>
              <h1>Shukuma Exercise App - Coming Soon</h1>
              <p>Your fitness friend is being built</p>
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
