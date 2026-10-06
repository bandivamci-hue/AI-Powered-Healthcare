import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ScanPrescriptionPage from './pages/ScanPrescriptionPage';
import ScanResultsPage from './pages/ScanResultsPage';
import RemindersPage from './pages/RemindersPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HealthCenterPage from './pages/HealthCenterPage';
import ArticlePage from './pages/ArticlePage';

import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/responsive.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Marketing Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Core Protected Patient Application Suite */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/scan-prescription" element={<ProtectedRoute><ScanPrescriptionPage /></ProtectedRoute>} />
            <Route path="/scan-prescription/results" element={<ProtectedRoute><ScanResultsPage /></ProtectedRoute>} />
            <Route path="/reminders" element={<ProtectedRoute><RemindersPage /></ProtectedRoute>} />
            <Route path="/health-center" element={<ProtectedRoute><HealthCenterPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/health-education/:id" element={<ProtectedRoute><ArticlePage /></ProtectedRoute>} />

            {/* Smart Navigation Redirects */}
            <Route path="/history" element={<Navigate to="/profile?tab=history" replace />} />
            <Route path="/health-education" element={<Navigate to="/health-center?tab=education" replace />} />
            <Route path="/emergency" element={<Navigate to="/health-center?tab=emergency" replace />} />
            <Route path="/symptoms" element={<Navigate to="/health-center" replace />} />
            <Route path="/ai-assistant" element={<Navigate to="/dashboard" replace />} />
            <Route path="/medicines" element={<Navigate to="/dashboard" replace />} />
            <Route path="/voice-assistant" element={<Navigate to="/dashboard" replace />} />
            <Route path="/voice" element={<Navigate to="/dashboard" replace />} />
            <Route path="/reports" element={<Navigate to="/profile?tab=history" replace />} />
            <Route path="/explain" element={<Navigate to="/profile?tab=history" replace />} />
            <Route path="/translation" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
