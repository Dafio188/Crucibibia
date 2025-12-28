import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage, YearPage, GamePage, SettingsPage, HelpPage } from './pages';
import { useAppSettings } from './hooks/useGameStorage';

function AppContent() {
  const { settings } = useAppSettings();

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/year/:year" element={<YearPage />} />
      <Route path="/game/:year/:month" element={<GamePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/help" element={<HelpPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
