import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import ProjectDetail from './pages/ProjectDetail';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import LearningJourney from './pages/LearningJourney';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
          <Route path="blogs" element={<BlogList />} />
          <Route path="blogs/:slug" element={<BlogDetail />} />
          <Route path="learning" element={<LearningJourney />} />
          <Route path="admin/login" element={<AdminLogin />} />

          <Route element={<ProtectedRoute />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
