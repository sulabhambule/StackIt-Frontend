"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronUp, ChevronDown, Check, User, Home, Search, MessageSquare, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { questionAPI } from "@/api/questionService"
import { answerAPI } from "@/api/answerService"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import RichTextEditor from "@/components/RichTextEditor"
import HTMLRenderer from "@/components/HTMLRenderer"
import ReportDialog from "@/components/ReportDialog"
import { useToast } from "@/hooks/use-toast"

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [error, setError] = useState(null);

  // Fetch question details
  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        setLoading(true);
        const response = await questionAPI.getQuestionById(id);
        if (response.success) {
          setQuestion(response.data);
          setAnswers(response.data.answers || []);
        } else {
          setError(response.message || "Failed to fetch question");
        }
      } catch (err) {
        console.error("Error fetching question:", err);
        setError(err.message || "Failed to fetch question details");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchQuestionDetails();
    }
  }, [id]);

  // Handle voting on answers
  const handleVote = async (answerId, direction) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote on answers",
        variant: "destructive",
      });
      return;
    }
    try {
      const voteValue = direction === "up" ? 1 : -1;
      const response = await answerAPI.voteAnswer(answerId, voteValue);

      if (response.success) {
        // Update the answer votes in the local state
        setAnswers((prevAnswers) =>
          prevAnswers.map((answer) =>
            answer._id === answerId
              ? {
                  ...answer,
                  votes:
                    response.data.action === "removed"
                      ? answer.votes - voteValue
                      : response.data.action === "updated"
                      ? answer.votes + voteValue * 2 // Remove old vote and add new
                      : answer.votes + voteValue,
                }
              : answer
          )
        );

        toast({
          title: "Vote Recorded",
          description: `Answer ${
            direction === "up" ? "upvoted" : "downvoted"
          } successfully`,
        });
      }
    } catch (err) {
      console.error("Error voting:", err);
      toast({
        title: "Vote Failed",
        description: err.message || "Failed to record vote",
        variant: "destructive",
      });
    }
  };

  // Handle accepting an answer
  const handleAcceptAnswer = async (answerId) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to accept answers",
        variant: "destructive",
      });
      return;
    }
    if (user?._id !== question?.owner?._id) {
      toast({
        title: "Permission Denied",
        description: "Only the question owner can accept answers",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await answerAPI.acceptAnswer(answerId);

      if (response.success) {
        // Update the answers state to reflect the accepted answer
        setAnswers((prevAnswers) =>
          prevAnswers.map((answer) => ({
            ...answer,
            isAccepted: answer._id === answerId ? !answer.isAccepted : false,
          }))
        );

        toast({
          title: "Answer Accepted",
          description: "Answer has been marked as accepted",
        });
      }
    } catch (err) {
      console.error("Error accepting answer:", err);
      toast({
        title: "Accept Failed",
        description: err.message || "Failed to accept answer",
        variant: "destructive",
      });
    }
  };

  // Handle submitting new answer
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit an answer",
        variant: "destructive",
      });
      return;
    }

    if (!newAnswer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please enter your answer",
        variant: "destructive",
      });
      return;
    }
    try {
      setSubmittingAnswer(true);
      const response = await answerAPI.submitAnswer(id, { body: newAnswer });

      if (response.success) {
        // Add the new answer to the list
        const newAnswerObj = {
          ...response.data,
          votes: 0,
          isAccepted: false,
          owner: user,
        };
        setAnswers((prevAnswers) => [...prevAnswers, newAnswerObj]);
        setNewAnswer("");

        toast({
          title: "Answer Submitted",
          description: "Your answer has been posted successfully",
        });
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to submit answer",
        variant: "destructive",
      });
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || "Question not found"}</p>
            <Button onClick={() => navigate("/")} variant="outline">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-2 sm:py-0">
            <div className="flex items-center space-x-4 sm:space-x-8 mb-2 sm:mb-0">
              <div className="flex items-center">
                <h1
                  className="text-2xl font-bold text-blue-600 cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  StackIt
                </h1>
              </div>
              <nav className="flex space-x-4 sm:space-x-6">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </button>
              </nav>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80"
                />
              </div>
              <div className="flex items-center space-x-2">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate("/user")}
                      className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">
                        {user?.name}
                      </span>
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={() => navigate("/auth")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500 mb-6">
          <button onClick={() => navigate("/")} className="hover:text-gray-700">
            Home
          </button>
          <span className="mx-2">{">"}</span>
          <span>Questions</span>
          <span className="mx-2">{">"}</span>
          <span className="text-gray-900 truncate">
            {question.title.length > 50
              ? question.title.substring(0, 50) + "..."
              : question.title}
          </span>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Content */}
          <div className="lg:col-span-3">
            {/* Question Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {question.title}
                </h1>
                <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span>Asked by {question.owner?.name || "Anonymous"}</span>
                  <span>{formatTimeAgo(question.createdAt)}</span>
                  <span>{question.views || 0} views</span>
                </div>
                <div className="flex flex-wrap items-center space-x-2 mb-6">
                  {question.tags?.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="prose max-w-none mb-4">
                  <HTMLRenderer content={question.description} />
                </div>

                {/* Question Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    {/* Vote buttons could go here */}
                  </div>
                  <div className="flex items-center space-x-2">
                    {isAuthenticated && user?._id !== question.owner?._id && (
                      <ReportDialog 
                        targetType="question" 
                        targetId={question._id}
                        title="Report Question"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Answers Section */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Answers ({answers.length})
                </h2>
                {answers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No answers yet. Be the first to answer!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {answers.map((answer) => (
                      <div
                        key={answer._id}
                        className="border-b border-gray-200 pb-6 last:border-b-0"
                      >
                        <div className="flex space-x-4">
                          {/* Vote Controls */}
                          <div className="flex flex-col items-center space-y-2">
                            <button
                              onClick={() => handleVote(answer._id, "up")}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              disabled={!isAuthenticated}
                            >
                              <ChevronUp className="w-6 h-6 text-gray-600 hover:text-green-600" />
                            </button>
                            <span className="text-lg font-semibold text-gray-900">
                              {answer.votes || 0}
                            </span>
                            <button
                              onClick={() => handleVote(answer._id, "down")}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              disabled={!isAuthenticated}
                            >
                              <ChevronDown className="w-6 h-6 text-gray-600 hover:text-red-600" />
                            </button>
                            {user?._id === question.owner?._id && (
                              <button
                                onClick={() => handleAcceptAnswer(answer._id)}
                                className={`p-1 rounded transition-colors ${
                                  answer.isAccepted
                                    ? "bg-green-100 text-green-600"
                                    : "hover:bg-gray-100 text-gray-600 hover:text-green-600"
                                }`}
                                title={
                                  answer.isAccepted
                                    ? "Unaccept answer"
                                    : "Accept answer"
                                }
                              >
                                <Check className="w-6 h-6" />
                              </button>
                            )}
                          </div>
                          {/* Answer Content */}
                          <div className="flex-1">
                            <div className="prose max-w-none mb-4">
                              <HTMLRenderer content={answer.body} />
                            </div>
                            <div className="flex flex-wrap items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                  <User className="w-3 h-3 text-gray-600" />
                                </div>
                                <span>{answer.owner?.name || "Anonymous"}</span>
                                <span>{formatTimeAgo(answer.createdAt)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {answer.isAccepted && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    ✓ Accepted Answer
                                  </Badge>
                                )}
                                {isAuthenticated && user?._id !== answer.owner?._id && (
                                  <ReportDialog 
                                    targetType="answer" 
                                    targetId={answer._id}
                                    title="Report Answer"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Submit Answer Form */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Submit Your Answer
                </h3>
                {!isAuthenticated ? (
                  <Alert>
                    <AlertDescription>
                      Please{" "}
                      <button
                        onClick={() => navigate("/auth")}
                        className="text-blue-600 underline"
                      >
                        log in
                      </button>{" "}
                      to submit an answer.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmitAnswer}>
                    <div className="mb-4">
                      <RichTextEditor
                        value={newAnswer}
                        onChange={setNewAnswer}
                        placeholder="Write your answer here..."
                        minHeight="200px"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={submittingAnswer || !newAnswer.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {submittingAnswer ? "Submitting..." : "Submit Answer"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Question Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views:</span>
                    <span className="font-semibold">{question.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Answers:</span>
                    <span className="font-semibold">{answers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Asked:</span>
                    <span className="font-semibold">
                      {formatTimeAgo(question.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Related Questions
                </h3>
                <div className="space-y-3">
                  <a
                    href="#"
                    className="block text-blue-600 hover:text-blue-800 text-sm"
                  >
                    How to concatenate strings in SQL?
                  </a>
                  <a
                    href="#"
                    className="block text-blue-600 hover:text-blue-800 text-sm"
                  >
                    SQL JOIN vs UNION - What's the difference?
                  </a>
                  <a
                    href="#"
                    className="block text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Best practices for SQL column naming
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
