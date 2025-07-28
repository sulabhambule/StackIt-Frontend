"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  AlertCircle,
  Tag,
  FileText,
  Type,
  Loader2,
  HelpCircle,
} from "lucide-react";
import AskQuestionNavbar from "../navbar/AskQuestionNavbar";
import { useAuth } from "../contexts/AuthContext";
import { questionAPI } from "../api/questionService";
import TagInput from "../components/TagInput";
import RichTextEditor from "../components/RichTextEditor";
import {
  sanitizeHTML,
  validateHTMLLength,
  isHTMLEmpty,
} from "../utils/htmlSanitizer";
import { useToast } from "@/hooks/use-toast";

export default function AskQuestion() {
  const { toast } = useToast();

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  // Remove Quill editor modules and formats
  // const modules = { ... }
  // const formats = [ ... ]

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to ask a question.",
        variant: "destructive", // optional, based on your toast styling
      });

      // Optional redirect after delay:
      // const timeout = setTimeout(() => {
      //   navigate("/auth?returnUrl=/ask-question");
      // }, 1500);
      // return () => clearTimeout(timeout);

      return;
    }
  }, [isAuthenticated, navigate]);

  // Handle description change with validation
  const handleDescriptionChange = (html) => {
    setDescription(html);
    setDescriptionError("");

    // Validate content length
    const validation = validateHTMLLength(html, 10000);
    if (!validation.isValid) {
      setDescriptionError(
        `Description is too long (${validation.length}/${validation.maxLength} characters)`
      );
    }
  };

  // Clear editor content when successful submission
  useEffect(() => {
    if (!loading && success) {
      // Redirect to home page after successful submission
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  }, [loading, success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDescriptionError("");
    setSuccess("");

    // Check authentication first
    if (!isAuthenticated || !user) {
      setError("You must be logged in to submit a question.");
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a question.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Validate title
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    // Validate description
    if (isHTMLEmpty(description)) {
      setDescriptionError("Description is required.");
      return;
    }

    // Validate description length
    const validation = validateHTMLLength(description, 10000);
    if (!validation.isValid) {
      setDescriptionError(
        `Description is too long (${validation.length}/${validation.maxLength} characters)`
      );
      return;
    }

    // Validate tags
    if (tags.length === 0) {
      setError("Please add at least one tag.");
      return;
    }

    setLoading(true);
    try {
      // Sanitize HTML content before sending
      const sanitizedDescription = sanitizeHTML(description);

      await questionAPI.submitQuestion({
        title: title.trim(),
        description: sanitizedDescription,
        tags,
      });

      setSuccess("Question submitted successfully! Redirecting to home...");
      toast({
        title: "Success",
        description: "Your question has been submitted successfully.",
      });
      setTitle("");
      setTags([]);
      setDescription("");
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Question submission error:', err);
      const errorMessage = err.message || "Failed to submit question. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AskQuestionNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-3">
              Ask a Question
            </h1>
            <p className="text-slate-600 text-lg">
              Get help from the community by asking detailed questions
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-6 border-b">
              <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
                <FileText className="h-6 w-6 text-blue-600" />
                Question Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Title Input */}
                <div className="space-y-3">
                  <label
                    htmlFor="title"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <Type className="h-4 w-4 text-blue-600" />
                    Question Title
                  </label>
                  <Input
                    id="title"
                    placeholder="What specific problem are you trying to solve?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                    className="h-12 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Be specific and imagine you're asking a question to another
                    person
                  </p>
                </div>

                <Separator className="my-6" />

                {/* Rich Text Description */}
                <RichTextEditor
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe your problem in detail. Include what you've tried, expected results, and any error messages..."
                  label="Detailed Description"
                  required={true}
                  disabled={loading}
                  error={descriptionError}
                  maxLength={10000}
                  minHeight="250px"
                />

                <Separator className="my-6" />

                {/* Tags Input */}
                <TagInput
                  tags={tags}
                  setTags={setTags}
                  maxTags={5}
                  placeholder="Add relevant tags (e.g., react, javascript, css)..."
                  disabled={loading}
                />

                {/* Error & Success Messages */}
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700 font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700 font-medium">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Submitting Question...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Submit Question
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-3 text-lg">
                    Tips for a great question:
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Be specific about your problem and what you've tried
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Include relevant code snippets or error messages
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Use clear, descriptive tags to help others find your
                      question
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      Check if your question has been asked before
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
