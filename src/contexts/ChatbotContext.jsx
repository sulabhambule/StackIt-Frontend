import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { chatbotService } from '../api/chatbotService';

const ChatbotContext = createContext();

// Action types
const CHATBOT_ACTIONS = {
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_TYPING: 'SET_TYPING',
  SET_CONNECTED: 'SET_CONNECTED',
  CLEAR_CHAT: 'CLEAR_CHAT',
  MARK_MESSAGES_READ: 'MARK_MESSAGES_READ'
};

// Initial state
const initialState = {
  messages: [],
  isTyping: false,
  isConnected: false,
  quickActions: [
    {
      label: 'Sales Report',
      message: 'Show me the latest sales report',
      icon: 'chart',
      description: 'View current sales performance'
    },
    {
      label: 'Customer Analytics',
      message: 'Analyze customer data and trends',
      icon: 'analytics',
      description: 'Get customer insights'
    },
    {
      label: 'Revenue Overview',
      message: 'Show revenue breakdown for this month',
      icon: 'revenue',
      description: 'Monthly revenue analysis'
    },
    {
      label: 'Team Performance',
      message: 'How is my team performing?',
      icon: 'users',
      description: 'View team metrics'
    },
    {
      label: 'Schedule Meeting',
      message: 'Help me schedule a team meeting',
      icon: 'calendar',
      description: 'Calendar assistance'
    },
    {
      label: 'System Settings',
      message: 'Open system configuration settings',
      icon: 'settings',
      description: 'Configure your system'
    }
  ]
};

// Reducer
const chatbotReducer = (state, action) => {
  switch (action.type) {
    case CHATBOT_ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: action.payload
      };
    
    case CHATBOT_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    
    case CHATBOT_ACTIONS.SET_TYPING:
      return {
        ...state,
        isTyping: action.payload
      };
    
    case CHATBOT_ACTIONS.SET_CONNECTED:
      return {
        ...state,
        isConnected: action.payload
      };
    
    case CHATBOT_ACTIONS.CLEAR_CHAT:
      return {
        ...state,
        messages: []
      };
    
    case CHATBOT_ACTIONS.MARK_MESSAGES_READ:
      return {
        ...state,
        messages: state.messages.map(msg => ({
          ...msg,
          isRead: msg.type === 'bot' ? true : msg.isRead
        }))
      };
    
    default:
      return state;
  }
};

// Provider component
export const ChatbotProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatbotReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Get quick actions based on authentication status
  const getQuickActions = () => {
    if (isAuthenticated) {
      return [
        {
          label: 'Sales Report',
          message: 'Show me the latest sales report',
          icon: 'chart',
          description: 'View current sales performance'
        },
        {
          label: 'Customer Analytics',
          message: 'Analyze customer data and trends',
          icon: 'analytics',
          description: 'Get customer insights'
        },
        {
          label: 'Revenue Overview',
          message: 'Show revenue breakdown for this month',
          icon: 'revenue',
          description: 'Monthly revenue analysis'
        },
        {
          label: 'Team Performance',
          message: 'How is my team performing?',
          icon: 'users',
          description: 'View team metrics'
        },
        {
          label: 'Schedule Meeting',
          message: 'Help me schedule a team meeting',
          icon: 'calendar',
          description: 'Calendar assistance'
        },
        {
          label: 'System Settings',
          message: 'Open system configuration settings',
          icon: 'settings',
          description: 'Configure your system'
        }
      ];
    } else {
      return [
        {
          label: 'Learn About Features',
          message: 'What features does BusinessFlow offer?',
          icon: 'help',
          description: 'Discover our capabilities'
        },
        {
          label: 'Pricing Information',
          message: 'Tell me about your pricing plans',
          icon: 'revenue',
          description: 'View pricing options'
        },
        {
          label: 'Get Started',
          message: 'How do I get started with BusinessFlow?',
          icon: 'settings',
          description: 'Start your journey'
        },
        {
          label: 'Contact Support',
          message: 'I need help with something',
          icon: 'support',
          description: 'Get assistance'
        }
      ];
    }
  };

  // Initialize connection
  useEffect(() => {
    const initializeChatbot = async () => {
      try {
        await chatbotService.connect();
        dispatch({ type: CHATBOT_ACTIONS.SET_CONNECTED, payload: true });
        
        // Load chat history
        const history = await chatbotService.getChatHistory();
        dispatch({ type: CHATBOT_ACTIONS.SET_MESSAGES, payload: history });
      } catch (error) {
        console.error('Failed to initialize chatbot:', error);
        dispatch({ type: CHATBOT_ACTIONS.SET_CONNECTED, payload: false });
      }
    };

    initializeChatbot();

    // Cleanup on unmount
    return () => {
      chatbotService.disconnect();
    };
  }, []);

  // Send message function
  const sendMessage = async (content) => {
    const userMessage = {
      id: Date.now() + Math.random(),
      content,
      type: 'user',
      timestamp: new Date().toISOString(),
      isRead: true
    };

    dispatch({ type: CHATBOT_ACTIONS.ADD_MESSAGE, payload: userMessage });
    dispatch({ type: CHATBOT_ACTIONS.SET_TYPING, payload: true });

    try {
      const response = await chatbotService.sendMessage(content);
      
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + Math.random(),
          content: response.message,
          type: 'bot',
          timestamp: new Date().toISOString(),
          isRead: false,
          metadata: response.metadata
        };

        dispatch({ type: CHATBOT_ACTIONS.ADD_MESSAGE, payload: botMessage });
        dispatch({ type: CHATBOT_ACTIONS.SET_TYPING, payload: false });
      }, 1000 + Math.random() * 2000); // Simulate realistic response time

    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage = {
        id: Date.now() + Math.random(),
        content: 'Sorry, I encountered an error. Please try again later.',
        type: 'bot',
        timestamp: new Date().toISOString(),
        isRead: false
      };

      setTimeout(() => {
        dispatch({ type: CHATBOT_ACTIONS.ADD_MESSAGE, payload: errorMessage });
        dispatch({ type: CHATBOT_ACTIONS.SET_TYPING, payload: false });
      }, 1000);
    }
  };

  // Clear chat function
  const clearChat = () => {
    dispatch({ type: CHATBOT_ACTIONS.CLEAR_CHAT });
    chatbotService.clearHistory();
  };

  // Mark messages as read
  const markMessagesRead = () => {
    dispatch({ type: CHATBOT_ACTIONS.MARK_MESSAGES_READ });
  };

  const value = {
    messages: state.messages,
    isTyping: state.isTyping,
    isConnected: state.isConnected,
    quickActions: getQuickActions(),
    sendMessage,
    clearChat,
    markMessagesRead
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

// Custom hook
export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};
