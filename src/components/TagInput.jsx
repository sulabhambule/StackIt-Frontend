import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tag, X } from "lucide-react";
import { questionAPI } from "@/api/questionService";

export default function TagInput({ 
  tags, 
  setTags, 
  maxTags = 5, 
  placeholder = "Add relevant tags...",
  disabled = false 
}) {
  const [tagInput, setTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Fetch available tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await questionAPI.getTags();
        if (response.success) {
          setAvailableTags(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error);
        // Fallback to predefined tags if API fails
        setAvailableTags([
          { tag: "javascript", count: 0, popular: false },
          { tag: "react", count: 0, popular: false },
          { tag: "node.js", count: 0, popular: false },
          { tag: "python", count: 0, popular: false },
          { tag: "html", count: 0, popular: false },
          { tag: "css", count: 0, popular: false },
          { tag: "typescript", count: 0, popular: false },
          { tag: "express", count: 0, popular: false },
          { tag: "mongodb", count: 0, popular: false },
          { tag: "api", count: 0, popular: false },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Filter tags based on input
  useEffect(() => {
    if (tagInput.trim()) {
      const filtered = availableTags
        .filter(tagObj => 
          tagObj.tag.toLowerCase().includes(tagInput.toLowerCase()) &&
          !tags.includes(tagObj.tag)
        )
        .slice(0, 10);
      setFilteredTags(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredTags([]);
      setShowSuggestions(false);
    }
  }, [tagInput, availableTags, tags]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tagToAdd) => {
    const cleanTag = tagToAdd.trim().toLowerCase();
    if (cleanTag && !tags.includes(cleanTag) && tags.length < maxTags) {
      setTags([...tags, cleanTag]);
      setTagInput("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag) {
        addTag(newTag);
      }
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      // Remove last tag if input is empty
      removeTag(tags[tags.length - 1]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleInputFocus = () => {
    if (tagInput.trim() && filteredTags.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (tag) => {
    addTag(tag.tag);
  };

  return (
    <div className="space-y-3 relative">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Tag className="h-4 w-4" />
        Tags ({tags.length}/{maxTags})
      </label>
      
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={tagInput}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          disabled={disabled || tags.length >= maxTags}
          className="h-12 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
        />
        
        {showSuggestions && filteredTags.length > 0 && (
          <Card 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto shadow-lg border-slate-300"
          >
            <CardContent className="p-2">
              {filteredTags.map((tagObj, index) => (
                <div
                  key={tagObj.tag}
                  onClick={() => handleSuggestionClick(tagObj)}
                  className="flex items-center justify-between px-3 py-2 rounded cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span className="text-sm font-medium">{tagObj.tag}</span>
                  {tagObj.popular && (
                    <Badge variant="secondary" className="text-xs">
                      {tagObj.count} uses
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Press Enter or comma to add tags. Maximum {maxTags} tags allowed.
        {loading && " Loading suggestions..."}
      </p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-lg border">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer select-none hover:bg-red-100 hover:text-red-700 transition-colors duration-200 px-3 py-1 text-sm flex items-center gap-1"
              onClick={() => removeTag(tag)}
              title="Click to remove"
            >
              {tag}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
