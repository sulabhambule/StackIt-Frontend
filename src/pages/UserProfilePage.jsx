"use client"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Camera,
  Edit3,
  Award,
  MessageSquare,
  HelpCircle,
  Calendar,
  ChevronRight,
  User,
  Home,
  Search,
  Star,
  LogOut,
  Save,
  X,
  Trash2,
  Edit,
  Check,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { userAPI } from "../api/userService"
import { questionAPI } from "../api/questionService"
import { answerAPI } from "../api/answerService"

const UserProfilePage = () => {
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuth()

  // Utility function to strip HTML tags and get clean text
  const stripHtmlTags = (html) => {
    if (!html) return ""
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim()
  }

  const [activeTab, setActiveTab] = useState("questions")
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [badges, setBadges] = useState([])
  const [recentQuestions, setRecentQuestions] = useState([])
  const [recentAnswers, setRecentAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState(null)
  const [editQuestionForm, setEditQuestionForm] = useState({
    title: "",
    description: "",
    tags: [],
  })
  const [deletingQuestionId, setDeletingQuestionId] = useState(null)
  const [editingAnswerId, setEditingAnswerId] = useState(null)
  const [editAnswerForm, setEditAnswerForm] = useState({
    body: "",
  })
  const [deletingAnswerId, setDeletingAnswerId] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (authUser) {
      fetchUserData()
    } else {
      navigate('/auth')
    }
  }, [authUser, navigate])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all user data from backend APIs
      const [profileRes, statsRes, badgesRes, questionsRes, answersRes] = await Promise.all([
        userAPI.getUserProfile(),
        userAPI.getUserStats(),
        userAPI.getUserBadges(),
        userAPI.getUserQuestions({ limit: 10 }),
        userAPI.getUserAnswers({ limit: 10 }),
      ])

      if (profileRes.success) {
        setUser(profileRes.data)
        setEditForm({
          name: profileRes.data.name || "",
          email: profileRes.data.email || "",
        })
      } else {
        setError("Failed to load profile data")
      }

      // Set stats from backend
      if (statsRes.success) {
        setStats(statsRes.data)
      }

      // Set badges from backend
      if (badgesRes.success) {
        setBadges(badgesRes.data)
      }

      // Set questions from backend
      if (questionsRes.success) {
        setRecentQuestions(questionsRes.data.questions || [])
      }

      // Set answers from backend
      if (answersRes.success) {
        setRecentAnswers(answersRes.data.answers || [])
      }
    } catch (err) {
      setError(err.message || "Failed to load user data")
      console.error("Error fetching user data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async (field) => {
    try {
      setError(null)

      // Basic validation
      if (field === "name" && !editForm.name.trim()) {
        setError("Name cannot be empty")
        return
      }

      if (field === "email" && !editForm.email.trim()) {
        setError("Email cannot be empty")
        return
      }

      if (field === "email" && !/\S+@\S+\.\S+/.test(editForm.email)) {
        setError("Please enter a valid email address")
        return
      }

      const response = await userAPI.updateUserProfile(editForm)
      if (response.success) {
        setUser(response.data)
        if (field === "name") setIsEditingName(false)
        if (field === "email") setIsEditingEmail(false)
        // Update the form with the latest user data
        setEditForm({
          name: response.data.name || "",
          email: response.data.email || "",
        })
        setSuccessMessage("Profile updated successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setError(err.message || "Failed to update profile")
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Avatar file size must be less than 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      setError(null)
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setAvatarPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return

    try {
      setUploadingAvatar(true)
      setError(null)
      const response = await userAPI.updateUserAvatar(avatarFile)
      if (response.success) {
        setUser(response.data)
        setAvatarFile(null)
        setAvatarPreview(null)
        // Refresh user data to get the latest avatar URL
        const profileRes = await userAPI.getUserProfile()
        if (profileRes.success) {
          setUser(profileRes.data)
        }
        setSuccessMessage("Avatar updated successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setError(err.message || "Failed to upload avatar")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleEditQuestion = (question) => {
    setEditingQuestionId(question._id)

    // Safely handle tags - convert to array if needed
    let tags = []
    if (Array.isArray(question.tags)) {
      tags = question.tags.map((tag) => String(tag))
    } else if (question.tags) {
      tags = String(question.tags)
        .split(",")
        .map((tag) => String(tag).trim())
        .filter((tag) => tag)
    }

    setEditQuestionForm({
      title: question.title || "",
      description: question.description || "",
      tags: tags,
    })
  }

  const handleUpdateQuestion = async () => {
    try {
      setError(null)

      // Basic validation
      if (!editQuestionForm.title.trim()) {
        setError("Question title is required")
        return
      }

      if (!editQuestionForm.description.trim()) {
        setError("Question description is required")
        return
      }

      if (!editQuestionForm.tags || editQuestionForm.tags.length === 0) {
        setError("At least one tag is required")
        return
      }
      // Ensure tags is an array and filter out empty tags
      const cleanTags = Array.isArray(editQuestionForm.tags)
        ? editQuestionForm.tags.map((tag) => String(tag).trim()).filter((tag) => tag)
        : String(editQuestionForm.tags || "")
            .split(",")
            .map((tag) => String(tag).trim())
            .filter((tag) => tag)
      if (cleanTags.length === 0) {
        setError("At least one valid tag is required")
        return
      }
      const updateData = {
        title: editQuestionForm.title.trim(),
        description: editQuestionForm.description.trim(),
        tags: cleanTags, // Send as array since backend now handles it properly
      }
      const response = await questionAPI.updateQuestion(editingQuestionId, updateData)

      if (response.success) {
        // Update the question in the local state
        setRecentQuestions((prevQuestions) =>
          prevQuestions.map((q) => (q._id === editingQuestionId ? { ...q, ...response.data } : q)),
        )
        setEditingQuestionId(null)
        setSuccessMessage("Question updated successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setError(err.message || "Failed to update question")
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      return
    }
    try {
      setDeletingQuestionId(questionId)
      setError(null)

      const response = await questionAPI.deleteQuestion(questionId)

      if (response.success) {
        // Remove the question from local state
        setRecentQuestions((prevQuestions) => prevQuestions.filter((q) => q._id !== questionId))
        // Update stats if available
        if (stats) {
          setStats((prevStats) => ({
            ...prevStats,
            questionsCount: Math.max(0, (prevStats.questionsCount || 1) - 1),
          }))
        }
        setSuccessMessage("Question deleted successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setError(err.message || "Failed to delete question")
    } finally {
      setDeletingQuestionId(null)
    }
  }

  const handleEditAnswer = (answer) => {
    setEditingAnswerId(answer._id)
    setEditAnswerForm({
      body: answer.body,
    })
  }

  const handleUpdateAnswer = async () => {
    try {
      setError(null)

      // Basic validation
      if (!editAnswerForm.body.trim()) {
        setError("Answer content is required")
        return
      }
      const response = await answerAPI.updateAnswer(editingAnswerId, editAnswerForm)

      if (response.success) {
        // Update the answer in the local state
        setRecentAnswers((prevAnswers) =>
          prevAnswers.map((a) => (a._id === editingAnswerId ? { ...a, ...response.data } : a)),
        )
        setEditingAnswerId(null)
        setSuccessMessage("Answer updated successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setError(err.message || "Failed to update answer")
    }
  }

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm("Are you sure you want to delete this answer? This action cannot be undone.")) {
      return
    }
    try {
      setDeletingAnswerId(answerId)
      setError(null)

      const response = await answerAPI.deleteAnswer(answerId)

      if (response.success) {
        // Remove the answer from local state
        setRecentAnswers((prevAnswers) => prevAnswers.filter((a) => a._id !== answerId))
        // Update stats if available
        if (stats) {
          setStats((prevStats) => ({
            ...prevStats,
            answersCount: Math.max(0, (prevStats.answersCount || 1) - 1),
          }))
        }
        setSuccessMessage("Answer deleted successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setError(err.message || "Failed to delete answer")
    } finally {
      setDeletingAnswerId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingQuestionId(null)
    setEditQuestionForm({
      title: "",
      description: "",
      tags: [],
    })
  }

  const handleCancelAnswerEdit = () => {
    setEditingAnswerId(null)
    setEditAnswerForm({
      body: "",
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  const timeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchUserData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
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
                  className="text-2xl font-bold text-blue-600 cursor-pointer ml-[-4px]"
                  onClick={() => navigate("/home")}
                >
                  StackIt
                </h1>
              </div>
              <nav className="flex space-x-4 sm:space-x-6">
                <button
                  className="flex items-center text-gray-600 hover:text-gray-900"
                  onClick={() => navigate("/home")}
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
                  placeholder="Search questions, tags, or users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80"
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <button
                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 flex items-center gap-2"
                  onClick={() => {
                    logout()
                    navigate("/login")
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Avatar Section */}
            <div className="relative mx-auto lg:mx-0">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                {avatarPreview ? (
                  <img
                    src={avatarPreview || "/placeholder.svg"}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                ) : user?.avatar ? (
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <User className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

              {avatarFile && (
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <button
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"
                  >
                    {uploadingAvatar ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setAvatarFile(null)
                      setAvatarPreview(null)
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {/* User Info */}
            <div className="flex-1 w-full">
              <div className="flex items-center space-x-3 mb-2">
                {isEditingName ? (
                  <div className="flex items-center space-x-2 w-full">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="text-3xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent w-full"
                    />
                    <button onClick={() => handleEditSubmit("name")} className="text-green-600 hover:text-green-700">
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false)
                        setEditForm({ ...editForm, name: user?.name || "" })
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900">{user?.name || "User"}</h1>
                    <button onClick={() => setIsEditingName(true)} className="text-gray-500 hover:text-gray-700">
                      <Edit3 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Email Section */}
              <div className="mb-4">
                {isEditingEmail ? (
                  <div className="flex items-center space-x-2 w-full">
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="text-gray-600 border-b-2 border-blue-500 focus:outline-none bg-transparent w-full"
                      placeholder="Enter email..."
                    />
                    <button onClick={() => handleEditSubmit("email")} className="text-green-600 hover:text-green-700">
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingEmail(false)
                        setEditForm({ ...editForm, email: user?.email || "" })
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-600">📧 {user?.email || "No email provided"}</p>
                    <button onClick={() => setIsEditingEmail(true)} className="text-gray-400 hover:text-gray-600">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {user?.createdAt ? formatDate(user.createdAt) : "Recently"}
                </div>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 text-center w-full lg:w-auto">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats?.reputation || 0}</div>
                <div className="text-sm text-gray-600">Reputation</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{badges?.length || 0}</div>
                <div className="text-sm text-gray-600">Badges</div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Questions Asked</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.questionsCount || 0}</p>
                  </div>
                  <HelpCircle className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Answers Given</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.answersCount || 0}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Upvotes</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalUpvotes || 0}</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
            {/* Activity Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-4 sm:space-x-8 px-6 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("questions")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "questions"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Recent Questions ({recentQuestions.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("answers")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "answers"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Recent Answers ({recentAnswers.length})
                  </button>
                </nav>
              </div>
              <div className="p-6">
                {activeTab === "questions" && (
                  <div className="space-y-6">
                    {recentQuestions.length > 0 ? (
                      recentQuestions.map((question) => (
                        <div key={question._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          {editingQuestionId === question._id ? (
                            // Edit Form
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                  type="text"
                                  value={editQuestionForm.title}
                                  onChange={(e) => setEditQuestionForm({ ...editQuestionForm, title: e.target.value })}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Question title..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                  value={editQuestionForm.description}
                                  onChange={(e) =>
                                    setEditQuestionForm({ ...editQuestionForm, description: e.target.value })
                                  }
                                  rows={4}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Describe your question in detail..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                                <input
                                  type="text"
                                  value={editQuestionForm.tags.join(", ")}
                                  onChange={(e) =>
                                    setEditQuestionForm({
                                      ...editQuestionForm,
                                      tags: e.target.value
                                        .split(",")
                                        .map((tag) => tag.trim())
                                        .filter((tag) => tag),
                                    })
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Tags (comma separated)"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={handleUpdateQuestion}
                                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Save Changes
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Normal Display
                            <>
                              <h3
                                className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer"
                                onClick={() => navigate(`/question/${question._id}`)}
                              >
                                {question.title}
                              </h3>
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {stripHtmlTags(question.description)?.substring(0, 150)}...
                              </p>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="flex flex-wrap gap-2">
                                    {(Array.isArray(question.tags)
                                      ? question.tags
                                      : question.tags
                                        ? String(question.tags)
                                            .split(",")
                                            .map((tag) => String(tag).trim())
                                        : []
                                    )?.map((tag, index) => (
                                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        {String(tag)}
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">{timeAgo(question.createdAt)}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>{question.votes || 0} votes</span>
                                  <span>{question.answerCount || 0} answers</span>
                                  <span>{question.views || 0} views</span>
                                </div>
                              </div>
                              {/* Edit/Delete Buttons - Show only for question owner */}
                              <div className="flex items-center gap-2 mt-4">
                                <button
                                  onClick={() => handleEditQuestion(question)}
                                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(question._id)}
                                  className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                                  disabled={deletingQuestionId === question._id}
                                >
                                  {deletingQuestionId === question._id ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No questions asked yet</p>
                    )}
                  </div>
                )}
                {activeTab === "answers" && (
                  <div className="space-y-6">
                    {recentAnswers.length > 0 ? (
                      recentAnswers.map((answer) => (
                        <div key={answer._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3
                              className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer flex-1"
                              onClick={() => navigate(`/question/${answer.questionId?._id || answer.questionId}`)}
                            >
                              {answer.questionId?.title || "Question"}
                            </h3>
                            {answer.isAccepted && (
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded flex items-center">
                                ✓ Accepted
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {stripHtmlTags(answer.body)?.substring(0, 150)}...
                          </p>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm text-gray-500">{timeAgo(answer.createdAt)}</span>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{answer.votes || 0} votes</span>
                              <span className="text-green-600">+{answer.isAccepted ? 25 : 10} points</span>
                            </div>
                          </div>
                          {/* Edit/Delete Buttons - Show only for answer owner */}
                          <div className="flex items-center gap-2 mt-4">
                            <button
                              onClick={() => handleEditAnswer(answer)}
                              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAnswer(answer._id)}
                              className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                              disabled={deletingAnswerId === answer._id}
                            >
                              {deletingAnswerId === answer._id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Delete
                            </button>
                          </div>
                          {editingAnswerId === answer._id && (
                            <div className="mt-4">
                              <textarea
                                value={editAnswerForm.body}
                                onChange={(e) => setEditAnswerForm({ ...editAnswerForm, body: e.target.value })}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Edit your answer..."
                              />
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={handleUpdateAnswer}
                                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Save Changes
                                </button>
                                <button
                                  onClick={handleCancelAnswerEdit}
                                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No answers given yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Badges */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                Badges ({badges.length})
              </h3>
              <div className="space-y-3">
                {badges.length > 0 ? (
                  badges.map((badge, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <Star className="w-6 h-6 text-yellow-500" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{badge.name}</p>
                        <p className="text-xs text-gray-500">{badge.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No badges earned yet</p>
                )}
              </div>
            </div>
            {/* Reputation Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reputation Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Questions Asked</span>
                  <span className="font-semibold text-blue-600">+{stats?.questionsCount * 5 || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Answers Given</span>
                  <span className="font-semibold text-green-600">+{stats?.answersCount * 10 || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Upvotes Received</span>
                  <span className="font-semibold text-green-600">+{stats?.totalUpvotes * 2 || 0}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-gray-900">Total Reputation</span>
                  <span className="text-blue-600">{stats?.reputation || 0}</span>
                </div>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-between"
                  onClick={() => navigate("/ask-question")}
                >
                  Ask a Question
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-between"
                  onClick={() => navigate("/home")}
                >
                  Browse Questions
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-between">
                  Edit Profile
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage
