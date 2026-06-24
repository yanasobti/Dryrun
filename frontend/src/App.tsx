import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { LearnPage } from './pages/LearnPage';
import { LoginPage } from './pages/LoginPage';
import { SavedPage } from './pages/SavedPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/explore" 
            element={
              <ProtectedRoute>
                <ExplorePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learn" 
            element={
              <ProtectedRoute>
                <LearnPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learn/:questionId" 
            element={
              <ProtectedRoute>
                <LearnPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/saved" 
            element={
              <ProtectedRoute>
                <SavedPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;