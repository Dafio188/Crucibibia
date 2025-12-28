import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage, YearPage, GamePage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/year/:year" element={<YearPage />} />
        <Route path="/game/:year/:month" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
