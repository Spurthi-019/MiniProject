import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MainDashboard from './pages/MainDashboard';
import RecommendationWidgetDemo from './pages/RecommendationWidgetDemo';
import ShadcnExample from './components/ShadcnExample';
import theme from './theme';
import './App.css';

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/main" element={<MainDashboard />} />
          <Route path="/demo/recommendations" element={<RecommendationWidgetDemo />} />
          <Route path="/demo/shadcn" element={<ShadcnExample />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
