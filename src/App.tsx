import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ParticleBackground } from './components/ParticleBackground';
import { SocialFloat } from './components/SocialFloat';

// Pages
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ResearchPage } from './pages/ResearchPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { GalleryPage } from './pages/GalleryPage';
import { CommitteePage } from './pages/CommitteePage';
import { ContactPage } from './pages/ContactPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
          <ParticleBackground />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/committee" element={<CommitteePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              {/* Fallback */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
          <SocialFloat />
        </div>
      </HashRouter>
    </ToastProvider>
  );
};

export default App;
