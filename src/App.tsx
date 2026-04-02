import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import GlobalChat from './pages/GlobalChat';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>;
  if (!user) return <Navigate to="/landing" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-slate-200">
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/global" element={
              <ProtectedRoute>
                <Layout>
                  <GlobalChat />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }} />
        </div>
      </Router>
    </AuthProvider>
  );
}
