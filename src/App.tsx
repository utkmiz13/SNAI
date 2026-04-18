// @ts-nocheck
// @ts-nocheck
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/AuthPage';
import { Home } from './pages/Home';
import { AIAssistant } from './pages/AIAssistant';
import { Gallery } from './pages/Gallery';
import { AdminPanel } from './pages/AdminPanel';
import { NoticeBoard } from './pages/NoticeBoard';
import { Complaints } from './pages/Complaints';
import { VisitorManagement } from './pages/VisitorManagement';
import { Community } from './pages/Community';
import { LocalServices } from './pages/LocalServices';
import { Documents } from './pages/Documents';
import { ProfilePage } from './pages/ProfilePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl animate-pulse">S</div>
        <p className="text-[hsl(var(--muted-foreground))] text-sm">Loading Sharda Nagar...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="notices" element={<NoticeBoard />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="visitors" element={<VisitorManagement />} />
        <Route path="community" element={<Community />} />
        <Route path="services" element={<LocalServices />} />
        <Route path="documents" element={<Documents />} />
        <Route path="ai" element={<AIAssistant />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const hasKeys = !!(import.meta as any).env.VITE_SUPABASE_URL;

  return (
    <ThemeProvider>
      <ToastProvider>
        {!hasKeys && (
          <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white p-3 text-center text-sm font-black shadow-2xl">
            🚨 ACTION REQUIRED: SUPABASE KEYS NOT FOUND ON VERCEL. GO TO VERCEL SETTINGS --&gt; ENVIRONMENT VARIABLES.
          </div>
        )}
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
