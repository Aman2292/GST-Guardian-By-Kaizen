import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Login from './pages/auth/Login';
import RegisterFirm from './pages/auth/RegisterFirm';
import AcceptInvite from './pages/auth/AcceptInvite';
import FirmDashboard from './pages/firm/FirmDashboard';
import CADashboard from './pages/ca/CADashboard';
import ClientDetails from './pages/ca/ClientDetails';
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

          <Route element={<ProtectedRoute allowedRoles={['firms']} />}>
            <Route path="/firm/dashboard" element={<FirmDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ca']} />}>
            <Route path="/ca/dashboard" element={<CADashboard />} />
            <Route path="/ca/clients/:id" element={<ClientDetails />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

import ClientDashboard from './pages/client/ClientDashboard';

// Helper to redirect based on role
const NavigateResolver = () => {
  const { user } = useAuth();
  if (user?.role === 'firms') return <Navigate to="/firm/dashboard" replace />;
  if (user?.role === 'ca') return <Navigate to="/ca/dashboard" replace />;
  if (user?.role === 'client') return <ClientDashboard />;
  return <Navigate to="/login" replace />;
};

export default App;
