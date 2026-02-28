import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layout/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import ProjectsPage from './pages/ProjectsPage';
import InflowsPage from './pages/InflowsPage';
import ExpensesPage from './pages/ExpensesPage';

function isAuthenticated() {
  return !!localStorage.getItem('dw_token');
}

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="inflows" element={<InflowsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

