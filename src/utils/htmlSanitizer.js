// HTML Sanitization utilities for rich text content

// Install dompurify for client-side sanitization:
// npm install dompurify @types/dompurify

import DOMPurify from 'dompurify';

// Configuration for allowed HTML elements and attributes
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'strike',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'span', 'div'
];

const ALLOWED_ATTRIBUTES = {
  'a': ['href', 'title', 'target', 'rel'],
  'span': ['style', 'class'],
  'div': ['class'],
  '*': ['class', 'style'] // Allow class and style on all elements
};

// Allowed CSS properties for style attribute
const ALLOWED_STYLES = [
  'color',
  'background-color',
  'text-align',
  'font-weight',
  'font-style',
  'text-decoration'
];

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} html - Raw HTML content
 * @returns {string} - Sanitized HTML content
 */
export const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Configure DOMPurify
  const config = {
    ALLOWED_TAGS,
    ALLOWED_ATTR: Object.values(ALLOWED_ATTRIBUTES).flat(),
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    WHOLE_DOCUMENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    // Custom hook to validate style attributes
    FORBID_ATTR: [],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  };

  // Sanitize the HTML
  let cleanHTML = DOMPurify.sanitize(html, config);

  // Additional cleaning for links
  cleanHTML = sanitizeLinks(cleanHTML);

  // Clean empty tags
  cleanHTML = removeEmptyTags(cleanHTML);

  return cleanHTML;
};

/**
 * Sanitize links to ensure they're safe
 * @param {string} html - HTML content with links
 * @returns {string} - HTML with sanitized links
 */
const sanitizeLinks = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const links = tempDiv.querySelectorAll('a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    
    if (href) {
      // Remove javascript: and data: protocols
      if (href.toLowerCase().startsWith('javascript:') || 
          href.toLowerCase().startsWith('data:') ||
          href.toLowerCase().startsWith('vbscript:')) {
        link.removeAttribute('href');
        return;
      }
      
      // Ensure external links open in new tab and have proper rel attributes
      if (href.startsWith('http://') || href.startsWith('https://')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    }
  });
  
  return tempDiv.innerHTML;
};

/**
 * Remove empty HTML tags
 * @param {string} html - HTML content
 * @returns {string} - HTML without empty tags
 */
const removeEmptyTags = (html) => {
  return html
    .replace(/<p><\/p>/g, '')
    .replace(/<p><br><\/p>/g, '')
    .replace(/<div><\/div>/g, '')
    .replace(/<span><\/span>/g, '')
    .replace(/<strong><\/strong>/g, '')
    .replace(/<em><\/em>/g, '')
    .replace(/<u><\/u>/g, '');
};

/**
 * Extract plain text from HTML content
 * @param {string} html - HTML content
 * @returns {string} - Plain text content
 */
export const extractTextFromHTML = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Validate HTML content length
 * @param {string} html - HTML content
 * @param {number} maxLength - Maximum allowed text length
 * @returns {object} - Validation result
 */
export const validateHTMLLength = (html, maxLength = 10000) => {
  const textContent = extractTextFromHTML(html);
  const length = textContent.length;
  
  return {
    isValid: length <= maxLength,
    length,
    maxLength,
    isEmpty: length === 0
  };
};

/**
 * Create a preview of HTML content (truncated)
 * @param {string} html - HTML content
 * @param {number} maxLength - Maximum preview length
 * @returns {string} - Preview text
 */
export const createHTMLPreview = (html, maxLength = 150) => {
  const textContent = extractTextFromHTML(html);
  
  if (textContent.length <= maxLength) {
    return textContent;
  }
  
  return textContent.substring(0, maxLength) + '...';
};

/**
 * Check if HTML content is empty or contains only whitespace/empty tags
 * @param {string} html - HTML content
 * @returns {boolean} - True if empty
 */
export const isHTMLEmpty = (html) => {
  if (!html || typeof html !== 'string') {
    return true;
  }
  
  const textContent = extractTextFromHTML(html);
  return textContent.trim().length === 0;
};

/**
 * Convert HTML to safe display format for lists/previews
 * @param {string} html - HTML content
 * @returns {string} - Safe display HTML
 */
export const htmlToSafeDisplay = (html) => {
  if (!html) return '';
  
  // First sanitize
  let cleanHTML = sanitizeHTML(html);
  
  // Remove certain formatting for list display
  cleanHTML = cleanHTML
    .replace(/<h[1-6][^>]*>/g, '<strong>')
    .replace(/<\/h[1-6]>/g, '</strong>')
    .replace(/<blockquote[^>]*>/g, '<em>')
    .replace(/<\/blockquote>/g, '</em>');
  
  return cleanHTML;
};

export default {
  sanitizeHTML,
  extractTextFromHTML,
  validateHTMLLength,
  createHTMLPreview,
  isHTMLEmpty,
  htmlToSafeDisplay
};
