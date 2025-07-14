import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Chart as ChartJS, registerables } from 'chart.js';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WeeklyReportForm from './pages/WeeklyReportForm';
import Reports from './pages/Reports';

// Register Chart.js components
ChartJS.register(...registerables);

// No authentication version
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="submit-report" element={<WeeklyReportForm />} />
          <Route path="reports" element={<Reports />} />
          <Route path="login" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;