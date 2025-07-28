import React from 'react';
import { Button } from '../ui/button';
import { 
  BarChart3, 
  Users, 
  Settings, 
  FileText, 
  HelpCircle, 
  Calendar,
  DollarSign,
  TrendingUp,
  Target,
  MessageSquare
} from 'lucide-react';
import { cn } from '../../lib/utils';

const iconMap = {
  chart: BarChart3,
  users: Users,
  settings: Settings,
  report: FileText,
  help: HelpCircle,
  calendar: Calendar,
  revenue: DollarSign,
  analytics: TrendingUp,
  goals: Target,
  support: MessageSquare
};

const QuickActions = ({ actions, onAction, compact = false }) => {
  const getIcon = (iconName) => {
    const Icon = iconMap[iconName] || MessageSquare;
    return <Icon className="h-4 w-4" />;
  };

  if (compact) {
    return (
      <div className="flex space-x-2 overflow-x-auto pb-1">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onAction(action)}
            className="flex-shrink-0 text-xs bg-gray-50 hover:bg-gray-100 border-gray-200"
          >
            {getIcon(action.icon)}
            <span className="ml-1">{action.label}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          onClick={() => onAction(action)}
          className={cn(
            "h-auto p-3 text-left justify-start bg-white hover:bg-gray-50 border-gray-200",
            "flex flex-col items-start space-y-1"
          )}
        >
          <div className="flex items-center space-x-2 w-full">
            <div className="p-1 bg-blue-50 rounded">
              {getIcon(action.icon)}
            </div>
            <span className="font-medium text-sm">{action.label}</span>
          </div>
          {action.description && (
            <span className="text-xs text-gray-500 text-left">
              {action.description}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;
