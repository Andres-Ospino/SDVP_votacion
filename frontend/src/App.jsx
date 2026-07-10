import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Public Pages
import Home from './pages/public/Home';
import Validate from './pages/public/Validate';
import Vote from './pages/public/Vote';
import Thanks from './pages/public/Thanks';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Candidates from './pages/admin/Candidates';
import Elections from './pages/admin/Elections';
import Admins from './pages/admin/Admins';
import AdminLayout from './layouts/AdminLayout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/validate" element={<Validate />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/thanks" element={<Thanks />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="elections" element={<Elections />} />
            <Route path="admins" element={<Admins />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
