import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import SprintBoard from './pages/SprintBoard';
import Team from './pages/Team';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { useProjectStore } from './store/useProjectStore';

function App() {
  const bootstrap = useProjectStore(state => state.bootstrap);
  const isLoading = useProjectStore(state => state.isLoading);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary animate-pulse">
          Initializing TechFlow database...
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="sprint" element={<SprintBoard />} />
          <Route path="team" element={<Team />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<div className="p-8 text-center text-xs text-enterprise-textSecondary">Page not found.</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
