import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Login from './pages/auth/Login';
import RegisterFirm from './pages/auth/RegisterFirm';
import AcceptInvite from './pages/auth/AcceptInvite';
import FirmDashboard from './pages/firm/FirmDashboard';
import CADashboard from './pages/ca/CADashboard';
import ProtectedRoute from './components/shared/ProtectedRoute';
import useAuth from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register-firm" element={<RegisterFirm />} />
          <Route path="/register/ca" element={<AcceptInvite />} />
          <Route path="/register/client" element={<AcceptInvite />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<NavigateResolver />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ca']} />}>
            {/* CA Specific Routes */}
            {/* If role is 'ca' but isAdmin is true, they might access Firm Dashboard */}
            <Route path="/firm/dashboard" element={<FirmDashboardWrapper />} />
            <Route path="/ca/dashboard" element={<CADashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Helper to redirect based on role
const NavigateResolver = () => {
  const { user } = useAuth();
  if (user?.role === 'ca' && user?.isAdmin) return <Navigate to="/firm/dashboard" replace />;
  if (user?.role === 'ca') return <Navigate to="/ca/dashboard" replace />;
  if (user?.role === 'client') return <div className="p-8 text-white">Client Portal Coming Soon</div>;
  return <Navigate to="/login" replace />;
};

const FirmDashboardWrapper = () => {
  const { user } = useAuth();
  // Double check admin status
  if (!user?.isAdmin) return <Navigate to="/unauthorized" replace />;
  return <FirmDashboard />;
};

export default App;
