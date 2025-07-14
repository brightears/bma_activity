import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import ReportView from './components/ReportView';
import Header from './components/Header';
import './App.css';

// Simplified App without authentication
function App() {
  // Mock user for the system
  const mockUser = {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'team@bmasiapte.com',
    username: 'BMA Team',
    full_name: 'BMA Team',
    role: 'admin'
  };

  // Provide mock auth context
  window.mockAuth = {
    user: mockUser,
    profile: mockUser,
    apiCall: async (endpoint, options = {}) => {
      const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
          // Send a mock token that the backend can recognize
          'Authorization': 'Bearer mock-token-for-internal-use'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API call failed');
      }

      return response.status === 204 ? null : await response.json();
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/report/new" element={<ReportForm />} />
          <Route path="/report/:id" element={<ReportView />} />
          <Route path="/report/:id/edit" element={<ReportForm editMode />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;