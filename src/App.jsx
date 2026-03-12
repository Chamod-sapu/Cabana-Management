import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Guests from "./pages/Guests.jsx";
import Bookings from "./pages/Bookings.jsx";
import Billing from "./pages/Billing.jsx";
import Cabanas from "./pages/Cabanas.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import ActivityLogs from "./pages/ActivityLogs.jsx";
import Settings from "./pages/Settings.jsx";
import Maintenance from "./pages/Maintenance.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/maintenance" element={<Maintenance />} />

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="guests" element={<Guests />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="billing" element={<Billing />} />
          <Route path="cabanas" element={<Cabanas />} />
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["SUPER_USER", "ADMIN"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="logs"
            element={
              <ProtectedRoute allowedRoles={["SUPER_USER"]}>
                <ActivityLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={["SUPER_USER"]}>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

