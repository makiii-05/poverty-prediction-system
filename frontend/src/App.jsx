import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

/* Pages Imports */

// Admin Login page
import AdminLoginForm from "./pages/AdminLoginForm";

// Landing page
import LandingPage from "./pages/LandingPage";

// User pages
import UserDashboard from "./pages/user/UserDashboard";
import RegionalData from "./pages/user/RegionalData";
import Predictions from "./pages/user/Predictions";
import Visualization from "./pages/user/Visualization";
import Reports from "./pages/user/Reports" ;

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import DataManagement from "./pages/admin/DataManagement";
import DatasetUpload from "./pages/admin/DatasetUpload";
import IndicatorManagement from "./pages/admin/IndicatorManagement";
import ModelTraining from "./pages/admin/ModelTraining";
import RegionManagement from "./pages/admin/RegionManagement";
import SystemMonitoring from "./pages/admin/SystemMonitoring";
import UserManagement from "./pages/admin/UserManagement";

// Components
import UnauthorizedPage from "./components/pages/UnauthorizedPage";

// Secure Route
import AdminRoute from "./routes/AdminRoute";
import UserRoute from "./routes/UserRoute";


function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

        {/* Login admin */}
        <Route path="/login/admin" element={<AdminLoginForm />} />
        
        {/* User Pages */}
        <Route path="/dashboard" element={<UserRoute><UserDashboard /></UserRoute>} />
        <Route path="/data" element={<UserRoute><RegionalData /></UserRoute>} />
        <Route path="/predictions" element={<UserRoute><Predictions /></UserRoute>} />
        <Route path="/visualization" element={<UserRoute><Visualization /></UserRoute>} />
        <Route path="/reports" element={<UserRoute><Reports /></UserRoute>} />

        {/* Admin Pages */}
        <Route
        path="/admin/dashboard"
        element={<AdminRoute><AdminDashboard /></AdminRoute>}
        />

        <Route
        path="/admin/dataset-upload"
        element={<AdminRoute><DatasetUpload /></AdminRoute>}
        />

        <Route
        path="/admin/data-management"
        element={<AdminRoute><DataManagement /></AdminRoute>}
        />

        <Route
        path="/admin/model-training"
        element={<AdminRoute><ModelTraining /></AdminRoute>}
        />

        <Route
        path="/admin/indicators"
        element={<AdminRoute><IndicatorManagement /></AdminRoute>}
        />

        <Route
        path="/admin/regions"
        element={<AdminRoute><RegionManagement /></AdminRoute>}
        />

        <Route
        path="/admin/monitoring"
        element={<AdminRoute><SystemMonitoring /></AdminRoute>}
        />

        <Route
        path="/admin/users"
        element={<AdminRoute><UserManagement /></AdminRoute>}
        />
        
        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;