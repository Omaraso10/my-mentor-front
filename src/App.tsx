import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import UsersPage from './pages/UsersPage';
import AdvisorPage from './pages/AdvisorPage';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/advisors" element={<AdvisorPage />}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;