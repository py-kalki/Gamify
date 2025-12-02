import { useState, useEffect } from 'react';
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

import { ResizeHandle } from './components/ResizeHandle';

function App() {
  const [mode, setMode] = useState<'dashboard' | 'widget'>('widget'); // Default to widget

  useEffect(() => {
    if (window.electron && window.electron.setMode) {
      window.electron.setMode(mode);
    }
  }, [mode]);

  useEffect(() => {
    // Listen for forced mode changes from main process (e.g. when closing dashboard)
    const handleForceWidget = () => setMode('widget');

    // We need to expose a listener in preload for this to work cleanly, 
    // or we can just rely on the fact that if main process resizes, 
    // we might want to manually switch. 
    // Actually, let's add the listener to preload first.
    if (window.electron && window.electron.onForceWidget) {
      window.electron.onForceWidget(handleForceWidget);
    }

    return () => {
      if (window.electron && window.electron.removeForceWidgetListener) {
        window.electron.removeForceWidgetListener(handleForceWidget);
      }
    };
  }, []);

  if (mode === 'widget') {
    return <WidgetPage onSwitchToDashboard={() => setMode('dashboard')} />;
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-background text-[var(--color-text)] overflow-hidden font-sans relative transition-colors duration-300 border border-white/10 rounded-lg">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <TopBar onSwitchToWidget={() => setMode('widget')} />
          <main className="flex-1 overflow-y-auto pb-20">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/timer" element={<TimerPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/productivity/trends" element={<TrendsPage />} />
              <Route path="/productivity/goals" element={<GoalsPage />} />
              <Route path="/productivity/insights" element={<InsightsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
          <ControlBar />
          <DebugOverlay />
          <ResizeHandle />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
