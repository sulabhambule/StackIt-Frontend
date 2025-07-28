import { useState, useEffect, useMemo, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../styles/rich-text-editor.css';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

// Register the emoji module
const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Describe your problem in detail...",
  label = "Detailed Description",
  required = false,
  disabled = false,
  error = null,
  maxLength = 10000,
  minHeight = "200px"
}) => {
  const [content, setContent] = useState(value || '');
  const [charCount, setCharCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const quillRef = useRef(null);

  // Update content when value prop changes
  useEffect(() => {
    setContent(value || '');
    // Count characters (strip HTML tags for accurate count)
    const textContent = new DOMParser()
      .parseFromString(value || '', 'text/html')
      .body.textContent || '';
    setCharCount(textContent.length);
  }, [value]);

  // Quill modules configuration with standard toolbar
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
    clipboard: {
      // Allow pasting of links
      matchVisual: false,
    }
  }), []);

  // Custom link handler for better UX
  const linkHandler = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        const currentFormat = quill.getFormat(range);
        const currentLink = currentFormat.link;
        
        const url = prompt(
          'Enter the URL:', 
          currentLink || 'https://'
        );
        
        if (url) {
          // Basic URL validation
          const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
          let finalUrl = url;
          
          // Add protocol if missing
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            finalUrl = 'https://' + url;
          }
          
          if (urlPattern.test(finalUrl)) {
            quill.format('link', finalUrl);
          } else {
            alert('Please enter a valid URL');
          }
        } else if (url === '') {
          // Remove link if empty string provided
          quill.format('link', false);
        }
      }
    }
  };

  // Register custom link handler after component mounts
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const toolbar = quill.getModule('toolbar');
      toolbar.addHandler('link', linkHandler);
    }
  }, []);

  // Quill formats configuration
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'blockquote', 'code-block',
    'link'
  ];

  // Handle emoji selection
  const onEmojiClick = (emojiObject) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      const position = range ? range.index : quill.getLength();
      quill.insertText(position, emojiObject.emoji);
      quill.setSelection(position + emojiObject.emoji.length);
    }
    setShowEmojiPicker(false);
  };

  // Handle content change
  const handleChange = (html) => {
    setContent(html);
    
    // Count characters (strip HTML tags)
    const textContent = new DOMParser()
      .parseFromString(html, 'text/html')
      .body.textContent || '';
    setCharCount(textContent.length);
    
    // Call parent onChange
    if (onChange) {
      onChange(html);
    }
  };

  // Validate content length
  const isOverLimit = charCount > maxLength;
  const isEmpty = charCount === 0;

  return (
    <div className="space-y-3">
      {/* Label */}
      <Label 
        htmlFor="rich-text-editor" 
        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
      >
        <FileText className="h-4 w-4 text-blue-600" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Editor Container */}
      <div className={`relative border rounded-lg overflow-hidden transition-colors ${
        error ? 'border-red-300' : 'border-slate-300 focus-within:border-blue-500'
      }`}>
        {/* Emoji Picker Button */}
        <div className="absolute top-2 right-2 z-10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="emoji-button h-8 w-8 p-0"
            title="Insert Emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute top-12 right-0 z-50 border rounded-lg shadow-lg bg-white">
            <EmojiPicker 
              onEmojiClick={onEmojiClick}
              width={300}
              height={400}
            />
          </div>
        )}
        
        <ReactQuill
          ref={quillRef}
          value={content}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          style={{
            minHeight: minHeight,
          }}
          className={`${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>

      {/* Character Count and Validation */}
      <div className="flex justify-between items-center text-xs">
        <div className="text-slate-500">
          Supports <strong>formatting</strong>, <em>links</em>, and 😀 emojis
        </div>
        <div className={`font-medium ${
          isOverLimit ? 'text-red-600' : 
          charCount > maxLength * 0.9 ? 'text-orange-600' : 'text-slate-500'
        }`}>
          {charCount.toLocaleString()} / {maxLength.toLocaleString()} characters
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Length Warning */}
      {isOverLimit && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700 font-medium">
            Content exceeds maximum length of {maxLength.toLocaleString()} characters.
          </AlertDescription>
        </Alert>
      )}

      {/* Required Field Warning */}
      {required && isEmpty && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700 font-medium">
            This field is required.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RichTextEditor;
