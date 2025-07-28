"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Calendar,
  Award,
  BookOpen,
  MessageSquare,
  ThumbsUp,
  Edit,
  Trophy,
  Star,
  Loader2,
  AlertCircle,
  Save,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/api/userService";
import { useToast } from "@/hooks/use-toast";

export default function UserProfile() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "" });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    fetchUserProfile();
  }, [isAuthenticated, navigate]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const [profileResponse, questionsResponse, answersResponse, statsResponse, badgesResponse] = await Promise.all([
        userAPI.getUserProfile(),
        userAPI.getUserQuestions({ limit: 3 }),
        userAPI.getUserAnswers({ limit: 3 }),
        userAPI.getUserStats(),
        userAPI.getUserBadges()
      ]);

      if (profileResponse.success && questionsResponse.success && answersResponse.success && statsResponse.success && badgesResponse.success) {
        const profile = profileResponse.data;
        const stats = statsResponse.data;
        const badges = badgesResponse.data;
        const questions = questionsResponse.data.questions || [];
        const answers = answersResponse.data.answers || [];

        const combinedUserData = {
          name: profile.name,
          email: profile.email,
          joinedDate: new Date(profile.createdAt).toLocaleDateString(),
          avatar: profile.avatar,
          stats: [
            {
              label: "Questions Asked",
              value: stats.questionsCount?.toString() || "0",
              icon: BookOpen,
              color: "text-blue-600",
            },
            {
              label: "Answers Given",
              value: stats.answersCount?.toString() || "0",
              icon: MessageSquare,
              color: "text-green-600",
            },
            {
              label: "Upvotes Received",
              value: stats.totalUpvotes?.toString() || "0",
              icon: ThumbsUp,
              color: "text-purple-600",
            },
            {
              label: "Reputation",
              value: stats.reputation?.toLocaleString() || "0",
              icon: Trophy,
              color: "text-yellow-600",
            },
          ],
          badges: badges || [],
          recentQuestions: questions.map((question) => ({
            id: question._id,
            title: question.title,
            date: new Date(question.createdAt).toLocaleDateString(),
            upvotes: question.upvotes || 0,
          })),
          postedAnswers: answers.map((answer) => ({
            id: answer._id,
            questionId: answer.questionId._id,
            questionTitle: answer.questionId.title,
            content: answer.body,
            date: new Date(answer.createdAt).toLocaleDateString(),
            votes: answer.votes || 0,
          })),
        };

        setUserData(combinedUserData);
        setEditForm({ name: profile.name });
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err.message || "Failed to load profile data");
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editing) {
      setEditForm({ name: userData.name });
    }
    setEditing(!editing);
  };

  const handleUpdateProfile = async () => {
    if (!editForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }

    setUpdating(true);
    try {
      const response = await userAPI.updateUserProfile({
        name: editForm.name.trim()
      });

      if (response.success) {
        setUserData(prev => ({
          ...prev,
          name: response.data.name
        }));
        setEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-700">User profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 
                className="text-2xl font-bold text-blue-600 cursor-pointer" 
                onClick={() => navigate('/')}
              >
                StackIt
              </h1>
              <nav className="flex space-x-6">
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  Home
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-700">{authUser?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="shadow-md border border-gray-200 bg-white mb-8">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-16 w-16 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                {editing ? (
                  <div className="mb-4">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="text-2xl font-bold mb-2 max-w-md"
                      placeholder="Enter your name"
                    />
                  </div>
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {userData.name}
                  </h1>
                )}
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-700 mb-4">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {userData.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {userData.joinedDate}
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  {editing ? (
                    <>
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={updating}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                      <Button 
                        onClick={handleEditToggle}
                        variant="outline"
                        disabled={updating}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={handleEditToggle}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {userData.stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <div
                        key={index}
                        className="text-center p-4 bg-gray-50 rounded-lg border"
                      >
                        <IconComponent className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                        <div className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600">
                          {stat.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Questions */}
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Recent Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userData.recentQuestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No questions asked yet</p>
                    <Button 
                      onClick={() => navigate('/ask-question')}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      Ask Your First Question
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userData.recentQuestions.map((question) => (
                      <div
                        key={question.id}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border"
                        onClick={() => navigate(`/question/${question.id}`)}
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {question.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{question.date}</span>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {question.upvotes}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Posted Answers */}
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  Recent Answers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userData.postedAnswers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No answers posted yet</p>
                    <Button 
                      onClick={() => navigate('/')}
                      className="mt-4 bg-green-600 hover:bg-green-700"
                    >
                      Browse Questions to Answer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userData.postedAnswers.map((answer) => (
                      <div
                        key={answer.id}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border"
                        onClick={() => navigate(`/question/${answer.questionId}`)}
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Re: {answer.questionTitle}
                        </h3>
                        <p className="text-sm mb-2 line-clamp-2 text-gray-600 leading-relaxed">
                          {answer.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{answer.date}</span>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {answer.votes}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Badges & Quick Actions */}
          <div className="space-y-8">
            {/* Badges & Achievements */}
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Badges & Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userData.badges.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">Start asking questions and providing answers to earn badges!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userData.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <Badge className={badge.color}>{badge.name}</Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          {badge.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/ask-question")}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Ask a Question
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Browse Questions
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/")}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  View Leaderboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
