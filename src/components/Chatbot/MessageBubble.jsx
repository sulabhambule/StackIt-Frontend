import React from 'react';
import { Bot, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

const MessageBubble = ({ message }) => {
  const { content, type, timestamp, isTyping, metadata } = message;
  const isBot = type === 'bot';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderContent = () => {
    // Handle different content types
    if (metadata?.type === 'card') {
      return (
        <div className="bg-white border rounded-lg p-3 mt-2">
          <h4 className="font-medium text-gray-900 mb-1">{metadata.title}</h4>
          <p className="text-sm text-gray-600">{metadata.description}</p>
          {metadata.actions && (
            <div className="flex space-x-2 mt-3">
              {metadata.actions.map((action, index) => (
                <Button key={index} size="sm" variant="outline" className="text-xs">
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (metadata?.type === 'list') {
      return (
        <div className="mt-2">
          <p className="mb-2">{content}</p>
          <ul className="space-y-1">
            {metadata.items.map((item, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // Default text content
    return (
      <p className="whitespace-pre-wrap break-words">{content}</p>
    );
  };

  return (
    <div className={cn(
      "flex space-x-3 max-w-[85%]",
      isBot ? "justify-start" : "justify-end ml-auto"
    )}>
      {isBot && (
        <div className="flex-shrink-0">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      )}
      
      <div className={cn(
        "group relative",
        isBot ? "order-2" : "order-1"
      )}>
        <div className={cn(
          "px-4 py-2 rounded-2xl text-sm",
          isBot 
            ? "bg-white border shadow-sm text-gray-900" 
            : "bg-blue-600 text-white"
        )}>
          {renderContent()}
          
          {metadata?.confidence && (
            <Badge 
              variant="secondary" 
              className="mt-2 text-xs bg-gray-100 text-gray-600"
            >
              Confidence: {Math.round(metadata.confidence * 100)}%
            </Badge>
          )}
        </div>
        
        {/* Message metadata */}
        <div className={cn(
          "flex items-center space-x-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isBot ? "justify-start" : "justify-end"
        )}>
          <span className="text-xs text-gray-500">
            {formatTime(timestamp)}
          </span>
          
          {isBot && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-6 w-6 text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-green-600"
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-red-600"
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {!isBot && (
        <div className="flex-shrink-0 order-2">
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
