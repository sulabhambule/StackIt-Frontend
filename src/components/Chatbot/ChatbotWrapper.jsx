import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import Chatbot from './Chatbot';

const ChatbotWrapper = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Don't show chatbot on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  // Show chatbot on all other pages (landing page and dashboard)
  return <Chatbot />;
};

export default ChatbotWrapper;
