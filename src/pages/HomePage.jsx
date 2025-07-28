"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronLeft,
  Search,
  MessageSquare,
  User,
  Clock,
  TrendingUp,
  Filter,
  Plus,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useQuestions } from "@/hooks/useQuestions";
import { useDebounce } from "@/hooks/useDebounce";
import { formatTagsForDisplay } from "@/utils/tagUtils";
import HTMLRenderer from "@/components/HTMLRenderer";
import NotificationDropdown from "../components/NotificationDropdown";

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [searchInput, setSearchInput] = useState("");
  const [currentSortBy, setCurrentSortBy] = useState("newest");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 500);

  const {
    questions,
    pagination,
    loading,
    error,
    updateSearch,
    updateSort,
    updatePage,
  } = useQuestions({
    page: 1,
    limit: 5,
    ...getSortParams(currentSortBy),
  });

  const handleAskQuestion = () => {
    // if (!isAuthenticated) {
    //   navigate("/login?returnUrl=/ask-question");
    //   return;
    // }
    navigate("/ask-question");
  };

  useEffect(() => {
    updateSearch(debouncedSearch);
  }, [debouncedSearch, updateSearch]);

  const handleSortChange = (sortBy) => {
    setCurrentSortBy(sortBy);
    const sortParams = getSortParams(sortBy);
    updateSort(sortParams.sortBy, sortParams.sortOrder);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  function getSortParams(sortBy) {
    switch (sortBy) {
      case "newest":
        return { sortBy: "createdAt", sortOrder: "desc" };
      case "unanswered":
        return { sortBy: "createdAt", sortOrder: "desc" };
      case "most-voted":
        return { sortBy: "votes", sortOrder: "desc" };
      case "recently-answered":
        return { sortBy: "updatedAt", sortOrder: "desc" };
      default:
        return { sortBy: "createdAt", sortOrder: "desc" };
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const handlePageChange = (pageNumber) => {
    updatePage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevPage = () => {
    if (pagination?.hasPrevPage) {
      handlePageChange(pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      handlePageChange(pagination.currentPage + 1);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    const totalPages = pagination?.totalPages || 1;
    const currentPage = pagination?.currentPage || 1;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "ghost"}
          onClick={() => handlePageChange(i)}
          className={`px-2 sm:px-4 rounded-lg transition-all duration-200 ${
            i === currentPage
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg"
              : "text-slate-700 hover:text-cyan-600 hover:bg-cyan-50"
          }`}
        >
          {i}
        </Button>
      );
    }
    return buttons;
  };

  const getSortLabel = (sortBy) => {
    switch (sortBy) {
      case "newest":
        return "Newest";
      case "unanswered":
        return "Unanswered";
      case "most-voted":
        return "Most Voted";
      case "recently-answered":
        return "Recently Answered";
      case "unsolved":
        return "Unsolved";
      default:
        return "Newest";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Mobile Header */}
        <div className="flex md:hidden justify-between items-center mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              StackIt
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <NotificationDropdown />
                <img
                  src={user?.avatar && user.avatar !== "https://via.placeholder.com/150x150/cccccc/666666?text=User" ? user.avatar : "https://via.placeholder.com/24"}
                  alt={user?.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/profile")}
                  className="text-xs px-2 py-1 h-auto"
                >
                  Profile
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs px-3 py-1 h-auto"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex flex-col md:flex-row justify-between items-center mb-12 pb-6 border-b border-slate-200">
          <div className="mb-4 md:mb-0">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
              StackIt
            </h1>
            <p className="text-slate-600 mt-2">
              Knowledge sharing community for developers
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <NotificationDropdown />
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate("/profile")}
                >
                  {user?.avatar && user.avatar !== "https://via.placeholder.com/150x150/cccccc/666666?text=User" ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover border border-slate-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="text-slate-700 font-medium">
                    Welcome, {user?.name || 'User'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {user?.role === 'admin' && (
                    <Button
                      variant="outline"
                      onClick={() => navigate("/admin")}
                      className="border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-500"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => logout()}
                    className="border-slate-300 text-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 shadow-lg transition-all duration-200 px-6"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="absolute top-0 right-0 w-80 max-w-[90vw] h-full bg-white shadow-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Menu</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-4">
                  <p className="text-sm font-medium text-slate-700 mb-3">
                    Sort Options
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant={currentSortBy === "newest" ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        currentSortBy === "newest"
                          ? "bg-slate-800 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                      onClick={() => handleSortChange("newest")}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Newest
                    </Button>
                    <Button
                      variant={
                        currentSortBy === "unanswered" ? "default" : "ghost"
                      }
                      className={`w-full justify-start ${
                        currentSortBy === "unanswered"
                          ? "bg-slate-800 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                      onClick={() => handleSortChange("unanswered")}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Unanswered
                    </Button>
                    <Button
                      variant={
                        currentSortBy === "most-voted" ? "default" : "ghost"
                      }
                      className={`w-full justify-start ${
                        currentSortBy === "most-voted"
                          ? "bg-slate-800 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                      onClick={() => handleSortChange("most-voted")}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Most Voted
                    </Button>
                    <Button
                      variant={
                        currentSortBy === "recently-answered"
                          ? "default"
                          : "ghost"
                      }
                      className={`w-full justify-start ${
                        currentSortBy === "recently-answered"
                          ? "bg-slate-800 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                      onClick={() => handleSortChange("recently-answered")}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Recently Answered
                    </Button>
                    <Button
                      variant={
                        currentSortBy === "unsolved" ? "default" : "ghost"
                      }
                      className={`w-full justify-start ${
                        currentSortBy === "unsolved"
                          ? "bg-slate-800 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                      onClick={() => handleSortChange("unsolved")}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Unsolved
                    </Button>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-slate-600">
                    Currently sorting by:{" "}
                    <span className="font-medium">
                      {getSortLabel(currentSortBy)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Action Bar */}
        <div className="md:hidden space-y-4 mb-6">
          <Button
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-200"
            onClick={handleAskQuestion}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ask New Question
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search questions, tags, or users..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 border-slate-300 bg-white/80 backdrop-blur-sm focus:bg-white transition-all duration-200 shadow-sm"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Sorted by:{" "}
              <span className="font-medium text-cyan-600">
                {getSortLabel(currentSortBy)}
              </span>
            </p>
          </div>
        </div>

        {/* Desktop Action Bar */}
        <div className="hidden md:flex flex-col lg:flex-row gap-4 mb-8 p-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-200 px-6"
              onClick={handleAskQuestion}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ask New Question
            </Button>
            <Button
              variant={currentSortBy === "newest" ? "default" : "secondary"}
              className={`transition-all duration-200 ${
                currentSortBy === "newest"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
              onClick={() => handleSortChange("newest")}
            >
              <Clock className="h-4 w-4 mr-2" />
              Newest
            </Button>
            <Button
              variant={currentSortBy === "unanswered" ? "default" : "secondary"}
              className={`transition-all duration-200 ${
                currentSortBy === "unanswered"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
              onClick={() => handleSortChange("unanswered")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Unanswered
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-200"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  More ▾
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white/95 backdrop-blur-sm"
              >
                <DropdownMenuItem
                  onClick={() => handleSortChange("most-voted")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Most Voted
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSortChange("recently-answered")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Recently Answered
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("unsolved")}>
                  <Clock className="h-4 w-4 mr-2" />
                  Unsolved
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Search Bar */}
          <div className="flex-1 max-w-md lg:ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search questions, tags, or users..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 border-slate-300 bg-white/80 backdrop-blur-sm focus:bg-white transition-all duration-200 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <p className="text-slate-600 text-sm sm:text-base">
            Showing{" "}
            {pagination.totalQuestions > 0
              ? `${(pagination.currentPage - 1) * 5 + 1}-${Math.min(
                  pagination.currentPage * 5,
                  pagination.totalQuestions
                )}`
              : "0"}{" "}
            of {pagination.totalQuestions || 0} questions
            {searchInput && ` for "${searchInput}"`}
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            <p className="text-slate-500 mt-4">Loading questions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
              Error: {error}
            </p>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4 mb-8">
          {questions.length === 0 && !loading ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">
                {searchInput
                  ? `No questions found for "${searchInput}"`
                  : "No questions available."}
              </p>
              <Button
                className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                onClick={handleAskQuestion}
              >
                Ask the First Question
              </Button>
            </div>
          ) : (
            questions.map((q) => (
              <Card
                key={q._id}
                className="bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-xl border border-slate-200 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/question/${q._id}`)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold mb-2 text-slate-900 group-hover:text-cyan-700 transition-colors duration-200 line-clamp-2">
                        {q.title}
                      </h2>
                      <div className="text-sm mb-4 line-clamp-2 text-slate-600 leading-relaxed">
                        <HTMLRenderer
                          content={q.description}
                          showAsPreview={true}
                          maxLength={150}
                          className="text-slate-600"
                        />
                      </div>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                        {formatTagsForDisplay(q.tags).map((tag, i) => (
                          <Badge
                            variant="outline"
                            key={i}
                            className="border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors duration-200 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {/* Meta Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            Asked by {q.owner?.name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span>{formatDate(q.createdAt)}</span>
                        </div>
                        {q.hasAcceptedAnswer && (
                          <span className="text-green-600 font-medium">
                            ✓ Solved
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Stats */}
                    <div className="flex flex-col gap-2 text-center min-w-[60px] sm:min-w-[80px] flex-shrink-0">
                      <div className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium">
                        <div className="font-bold">{q.votes || 0}</div>
                        <div className="text-xs">votes</div>
                      </div>
                      <div
                        className={`rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium ${
                          q.hasAcceptedAnswer
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800"
                            : "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800"
                        }`}
                      >
                        <div className="font-bold">{q.answerCount || 0}</div>
                        <div className="text-xs">answers</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 sm:gap-2 mt-12 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevPage}
              disabled={!pagination.hasPrevPage}
              className="text-slate-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 sm:h-10 sm:w-10"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1 sm:gap-2 overflow-x-auto max-w-[200px] sm:max-w-none">
              {renderPaginationButtons()}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage}
              className="text-slate-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 sm:h-10 sm:w-10"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
