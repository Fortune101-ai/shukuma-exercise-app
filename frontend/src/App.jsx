import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./store/store.js";
import {
  selectIsAuthenticated,
  setCredentials,
  setLoading,
  logout,
} from "./store/slices/auth.slice.js";
import { loadAuthToken } from "./store/middleware/auth.middleware.js";
import { authApi } from "./services/api.js";
import ToastProvider from "./components/providers/ToastProvider.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import SignupPage from "./pages/Auth/SignupPage.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import WorkoutsPage from "./pages/Workouts/WorkoutsPage.jsx";
import JournalPage from "./pages/Journal/JournalPage.jsx";
import TasksPage from "./pages/Tasks/TasksPage.jsx";
import ChallengesPage from "./pages/Challenges/ChallengesPage.jsx";
import Spinner from "./components/ui/Spinner.jsx";
import NutritionPage from "./pages/Nutrition/NutritionPage.jsx";
import ProgressPage from "./pages/Progress/ProgressPage.jsx";
import SocialPage from "./pages/Social/SocialPage.jsx";

function AppContent() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = loadAuthToken();

      if (token) {
        dispatch(setLoading(true));

        try {
          const userData = await authApi.getCurrentUser();

          dispatch(
            setCredentials({
              user: userData.user,
              token: token,
            })
          );

          console.log("Auth initialized - User:", userData.user.email);
        } catch (error) {
          console.error("Token verification failed:", error.message);

          dispatch(logout());
          localStorage.removeItem("shukuma_auth_token");
        } finally {
          dispatch(setLoading(false));
        }
      }

      setInitializing(false);
    };

    initializeAuth();
  }, [dispatch]);

  if (initializing) {
    return <Spinner fullScreen text="Initializing..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignupPage />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/workouts"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WorkoutsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <JournalPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TasksPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/challenges"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ChallengesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/nutrition"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NutritionPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProgressPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/social"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SocialPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
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
