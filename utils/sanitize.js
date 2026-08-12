/**
 * Shared HTML sanitizer — BUG-001
 * Sanitize user-supplied HTML before persisting, to prevent stored XSS.
 */
const sanitizeHtml = require('sanitize-html');

// Whitelist rich-text tags only (no script/iframe/object/embed/style/on*)
const ALLOWED_TAGS = [
  'p', 'br', 'b', 'strong', 'i', 'em', 'u', 's',
  'a', 'img', 'blockquote', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'code', 'pre', 'span', 'div', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'figure', 'figcaption'
];

const ALLOWED_ATTRIBUTES = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title'],
  span: ['class'],
  code: ['class'],
  pre: ['class'],
  div: ['class'],
  p: ['class']
};

const sanitizeContent = (html) => {
  if (html === undefined || html === null) return '';
  return sanitizeHtml(String(html), {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    // Only allow safe URL schemes (data: kept minimal for images)
    allowedSchemes: ['http', 'https', 'mailto', 'data'],
    disallowedTagsMode: 'discard'
  });
};

module.exports = { sanitizeContent };
