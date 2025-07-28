import React from 'react';
import { Bot } from 'lucide-react';
import { cn } from '../../lib/utils';

const TypingIndicator = () => {
  return (
    <div className="flex space-x-3 max-w-[85%]">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-blue-600" />
        </div>
      </div>
      
      <div className="bg-white border shadow-sm rounded-2xl px-4 py-3">
        <div className="flex space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot-1" />
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot-2" />
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
