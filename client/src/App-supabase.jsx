import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import ReportView from './components/ReportView';
import Header from './components/Header';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSupabaseAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// App Routes component
const AppRoutes = () => {
  const { user } = useSupabaseAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Header />}
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : <Login />
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/report/new" element={
            <ProtectedRoute>
              <ReportForm />
            </ProtectedRoute>
          } />
          
          <Route path="/report/:id" element={
            <ProtectedRoute>
              <ReportView />
            </ProtectedRoute>
          } />
          
          <Route path="/report/:id/edit" element={
            <ProtectedRoute>
              <ReportForm editMode />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
};

// Main App component
function App() {
  return (
    <SupabaseAuthProvider>
      <AppRoutes />
    </SupabaseAuthProvider>
  );
}

export default App;