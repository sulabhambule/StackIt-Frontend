// Utility functions for handling tags

// Normalize tags to always be an array
export const normalizeTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  return [];
};

// Convert tags array to comma-separated string for API
export const tagsToString = (tags) => {
  if (!tags) return '';
  if (Array.isArray(tags)) return tags.join(',');
  if (typeof tags === 'string') return tags;
  return '';
};

// Format tags for display
export const formatTagsForDisplay = (tags) => {
  const normalizedTags = normalizeTags(tags);
  return normalizedTags.map(tag => tag.trim()).filter(tag => tag);
};

// Check if a question matches tag filters
export const matchesTagFilter = (questionTags, filterTags) => {
  if (!filterTags || filterTags.length === 0) return true;
  
  const normalizedQuestionTags = normalizeTags(questionTags).map(tag => tag.toLowerCase());
  const normalizedFilterTags = normalizeTags(filterTags).map(tag => tag.toLowerCase());
  
  return normalizedFilterTags.some(filterTag => 
    normalizedQuestionTags.some(questionTag => 
      questionTag.includes(filterTag)
    )
  );
};
