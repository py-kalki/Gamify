// import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TimerPage } from './pages/TimerPage';
import { ActivityPage } from './pages/ActivityPage';
import { TrendsPage } from './pages/TrendsPage';
import { GoalsPage } from './pages/GoalsPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { WidgetPage } from './pages/WidgetPage';
import { ControlBar } from './components/ControlBar';
import { TopBar } from './components/TopBar';
import { DebugOverlay } from './components/DebugOverlay';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-background text-[var(--color-text)] overflow-hidden font-sans relative transition-colors duration-300">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <TopBar />
          <main className="flex-1 overflow-y-auto pb-20">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/timer" element={<TimerPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/productivity/trends" element={<TrendsPage />} />
              <Route path="/productivity/goals" element={<GoalsPage />} />
              <Route path="/productivity/insights" element={<InsightsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/widget" element={<WidgetPage />} />
            </Routes>
          </main>
          <ControlBar />
          <DebugOverlay />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
