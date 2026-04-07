import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

/* Pages Imports */

// Admin Login page
import AdminLoginForm from "./pages/AdminLoginForm";

// Landing page
import LandingPage from "./pages/LandingPage";

// User Layout and Admin Layout
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

// User pages
import UserDashboard from "./pages/user/UserDashboard";
import RegionalData from "./pages/user/RegionalData";
import UserPredictions from "./pages/user/UserPrediction";
import Visualization from "./pages/user/Visualization";

// Forgot password page
import ForgotPassword from "./pages/user/ForgotPassword";

//import Reports from "./pages/user/Reports" ;

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import DatasetManagement from "./pages/admin/DatasetManagement";
import Predict from "./pages/admin/Predict";
//import SystemMonitoring from "./pages/admin/SystemMonitoring";
import UserManagement from "./pages/admin/UserManagement";
import DataMonitoring from "./pages/admin/DataMonitoring";
import AdminReports from "./pages/admin/Reports";

// charts
import MapVisualization from "./pages/admin/Map";
import BarChart from "./pages/admin/BarChart";
import LineChart from "./pages/admin/LineChart"

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
        <Route path="/predictions" element={<UserRoute><UserPredictions /></UserRoute>} />
        <Route path="/visualization" element={<UserRoute><Visualization /></UserRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
        {/*<Route path="/reports" element={<UserRoute><Reports /></UserRoute>} />*/}

        {/* Admin Pages */}
        <Route
        path="/admin/dashboard"
        element={<AdminRoute><AdminDashboard /></AdminRoute>}
        />

        <Route
        path="/admin/predict"
        element={<AdminRoute><Predict /></AdminRoute>}
        />

        <Route
        path="/admin/dataset/management"
        element={<AdminRoute><DatasetManagement /></AdminRoute>}
        />

        
        <Route
        path="/admin/data/monitoring"
        element={<AdminRoute><DataMonitoring /></AdminRoute>}
        />

        <Route
        path="/admin/reports"
        element={<AdminRoute><AdminReports /></AdminRoute>}
        />

        <Route
        path="/admin/map"
        element={<AdminRoute><AdminLayout><MapVisualization /></AdminLayout></AdminRoute>}
        />

        <Route
        path="/admin/bar-chart"
        element={<AdminRoute><AdminLayout><BarChart /></AdminLayout></AdminRoute>}
        />

        <Route
        path="/admin/line-chart"
        element={<AdminRoute><AdminLayout><LineChart /></AdminLayout></AdminRoute>}
        />

        {/*User Visualization*/}
        <Route
        path="/visualization/map"
        element={<UserRoute><UserLayout><MapVisualization /></UserLayout></UserRoute>}
        />

        <Route
        path="/visualization/bar-chart"
        element={<UserRoute><UserLayout><BarChart /></UserLayout></UserRoute>}
        />

        <Route
        path="/visualization/line-chart"
        element={<UserRoute><UserLayout><LineChart /></UserLayout></UserRoute>}
        />

        {/*<Route
        path="/admin/system/monitoring"
        element={<AdminRoute><SystemMonitoring /></AdminRoute>}
        />
        */}

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