import React from 'react';
import DOMPurify from 'dompurify';
import '../styles/html-renderer.css';

const HTMLRenderer = ({ content, className = "", maxLength = null, showAsPreview = false }) => {
  if (!content) return null;

  // Sanitize HTML content for safe rendering
  const sanitizedHTML = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'a', 'b', 'i', 'em', 'strong', 'u', 'br', 'p', 'ul', 'ol', 'li', 
      'blockquote', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'span'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    ADD_ATTR: ['target'],
    ADD_TAGS: ['a']
  });

  // Add target="_blank" to external links for security
  const processedHTML = sanitizedHTML.replace(
    /<a\s+([^>]*href\s*=\s*["'][^"']*["'][^>]*)>/gi,
    '<a $1 target="_blank" rel="noopener noreferrer">'
  );

  // For preview mode, truncate HTML but keep formatting
  if (showAsPreview && maxLength) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedHTML;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // If content is short enough, render full HTML
    if (textContent.length <= maxLength) {
      return (
        <div 
          className={`rendered-html preview-mode ${className}`}
          dangerouslySetInnerHTML={{ __html: processedHTML }}
        />
      );
    }
    
    // For longer content, use CSS truncation to preserve HTML formatting
    return (
      <div 
        className={`rendered-html preview-mode truncated ${className}`}
        dangerouslySetInnerHTML={{ __html: processedHTML }}
      />
    );
  }

  // For full HTML rendering
  return (
    <div 
      className={`rendered-html ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHTML }}
    />
  );
};

export default HTMLRenderer;
