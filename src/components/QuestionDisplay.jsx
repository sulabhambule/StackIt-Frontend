import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatTagsForDisplay } from '@/utils/tagUtils';
import { htmlToSafeDisplay } from '@/utils/htmlSanitizer';
import { MessageSquare, User, Clock, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';

const QuestionDisplay = ({ 
  question, 
  showFullContent = false, 
  className = "",
  onTagClick = null
}) => {
  if (!question) return null;

  const {
    _id,
    title,
    description,
    tags,
    owner,
    createdAt,
    views = 0,
    upvotes = 0,
    downvotes = 0,
    answerCount = 0
  } = question;

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${className}`}>
      <CardContent className="p-6">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <h1 className={`font-bold text-slate-900 leading-tight ${
            showFullContent ? 'text-2xl' : 'text-xl'
          }`}>
            {title}
          </h1>
          
          {/* Question Stats */}
          <div className="flex items-center gap-4 text-sm text-slate-500 ml-4">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {views}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {answerCount}
            </div>
            {(upvotes > 0 || downvotes > 0) && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-green-600">
                  <ThumbsUp className="h-4 w-4" />
                  {upvotes}
                </div>
                <div className="flex items-center gap-1 text-red-600">
                  <ThumbsDown className="h-4 w-4" />
                  {downvotes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Question Content */}
        <div className={`mb-6 text-slate-700 leading-relaxed ${
          showFullContent ? 'prose prose-slate max-w-none' : 'line-clamp-3'
        }`}>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: htmlToSafeDisplay(description)
            }}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {formatTagsForDisplay(tags).map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={`bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer ${
                onTagClick ? 'hover:bg-blue-200' : ''
              }`}
              onClick={onTagClick ? () => onTagClick(tag) : undefined}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Question Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={owner?.avatar} 
                alt={owner?.name || 'User'} 
              />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                {getInitials(owner?.name || 'User')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 text-sm">
                  {owner?.name || 'Anonymous User'}
                </span>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  {formatDate(createdAt)}
                </div>
              </div>
              {owner?.email && (
                <div className="text-xs text-slate-500">
                  {owner.email}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons (if needed) */}
          {showFullContent && (
            <div className="flex items-center gap-2">
              {/* Add action buttons here if needed */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;
