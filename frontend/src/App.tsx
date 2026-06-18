import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { LearnPage } from './pages/LearnPage';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/:questionId" element={<LearnPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;