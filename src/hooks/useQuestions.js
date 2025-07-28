import { useState, useEffect, useCallback } from "react";
import { questionAPI } from "../api/questionService.js";

// Custom hook for fetching questions with filters and pagination
export const useQuestions = (initialParams = {}) => {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    search: "",
    tags: "",
    ...initialParams,
  });

  // Fetch questions function
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await questionAPI.getAllQuestions(params);

      if (response.success) {
        setQuestions(response.data.questions);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || "Failed to fetch questions");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError(err.message || "Failed to fetch questions");
      setQuestions([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, [params]);

  // Update search term with debouncing
  const updateSearch = useCallback((searchTerm) => {
    setParams((prev) => ({
      ...prev,
      search: searchTerm,
      page: 1, // Reset to first page when searching
    }));
  }, []);

  // Update sort parameters
  const updateSort = useCallback((sortBy, sortOrder = "desc") => {
    setParams((prev) => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 1, // Reset to first page when sorting
    }));
  }, []);

  // Update filters
  const updateFilters = useCallback((filters) => {
    setParams((prev) => ({
      ...prev,
      ...filters,
      page: 1, // Reset to first page when filtering
    }));
  }, []);

  // Update page
  const updatePage = useCallback((page) => {
    setParams((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  // Refresh questions
  const refresh = useCallback(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Fetch questions when params change
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    pagination,
    loading,
    error,
    params,
    updateSearch,
    updateSort,
    updateFilters,
    updatePage,
    refresh,
  };
};

// Custom hook for single question
export const useQuestion = (questionId) => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuestion = useCallback(async () => {
    if (!questionId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await questionAPI.getQuestionById(questionId);

      if (response.success) {
        setQuestion(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch question");
      }
    } catch (err) {
      console.error("Error fetching question:", err);
      setError(err.message || "Failed to fetch question");
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  // Refresh question
  const refresh = useCallback(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  return {
    question,
    loading,
    error,
    refresh,
  };
};

// Custom hook for trending questions
export const useTrendingQuestions = (limit = 5) => {
  const [trendingQuestions, setTrendingQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrendingQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await questionAPI.getTrendingQuestions(limit);

      if (response.success) {
        setTrendingQuestions(response.data);
      } else {
        throw new Error(
          response.message || "Failed to fetch trending questions"
        );
      }
    } catch (err) {
      console.error("Error fetching trending questions:", err);
      setError(err.message || "Failed to fetch trending questions");
      setTrendingQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTrendingQuestions();
  }, [fetchTrendingQuestions]);

  return {
    trendingQuestions,
    loading,
    error,
    refresh: fetchTrendingQuestions,
  };
};
