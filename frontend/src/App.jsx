import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import store from "./store/store.js";
import { setToken } from "./store/slices/auth.slice.js";
import { loadAuthToken } from "./store/middleware/auth.middleware.js";
import ToastProvider from "./components/providers/ToastProvider.jsx";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";

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
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Provider>
  );
}

export default App;
