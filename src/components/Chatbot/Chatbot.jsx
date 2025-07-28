import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  RotateCcw,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useChatbot } from '../../contexts/ChatbotContext';
import MessageBubble from './MessageBubble';
import QuickActions from './QuickActions';
import TypingIndicator from './TypingIndicator';
import './chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    isTyping,
    sendMessage,
    clearChat,
    isConnected,
    quickActions
  } = useChatbot();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = message;
    setMessage('');
    await sendMessage(userMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action) => {
    sendMessage(action.message);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 group",
            messages.filter(m => !m.isRead && m.type === 'bot').length > 0 && "chatbot-button-pulse"
          )}
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          {messages.filter(m => !m.isRead && m.type === 'bot').length > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center"
            >
              {messages.filter(m => !m.isRead && m.type === 'bot').length}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={cn(
        "w-96 shadow-2xl border-0 transition-all duration-300",
        isMinimized ? "h-16" : "h-[32rem]"
      )}>
        {/* Header */}
        <CardHeader className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="h-6 w-6" />
                <div className={cn(
                  "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white",
                  isConnected ? "bg-green-400" : "bg-red-400"
                )} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">BusinessFlow Assistant</h3>
                <p className="text-xs text-blue-100">
                  {isConnected ? 'Online' : 'Connecting...'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(32rem-4rem)]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 chatbot-messages">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Welcome to BusinessFlow!</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    I'm here to help you with your business operations. Ask me anything!
                  </p>
                  <QuickActions actions={quickActions} onAction={handleQuickAction} />
                </div>
              )}
              
              {messages.map((msg, index) => (
                <MessageBubble key={index} message={msg} />
              ))}
              
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length > 0 && (
              <div className="px-4 py-2 border-t bg-white">
                <QuickActions 
                  actions={quickActions.slice(0, 3)} 
                  onAction={handleQuickAction}
                  compact 
                />
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t bg-white rounded-b-lg">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    rows="1"
                    style={{
                      minHeight: '40px',
                      maxHeight: '100px'
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                    }}
                    disabled={!isConnected}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !isConnected}
                  className="bg-blue-600 hover:bg-blue-700 px-3"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Press Enter to send</span>
                <span className={cn(
                  "flex items-center space-x-1",
                  isConnected ? "text-green-600" : "text-red-600"
                )}>
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    isConnected ? "bg-green-400" : "bg-red-400"
                  )} />
                  <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                </span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default Chatbot;
