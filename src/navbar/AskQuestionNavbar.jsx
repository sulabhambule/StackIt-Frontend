"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  UserCircle,
  Home,
  Settings,
  LogOut,
  User,
  Award,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

export default function AskQuestionNavbar() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState({ id: "", name: "", email: "" });

  useEffect(() => {
    // Get user info from session storage
    const userId = sessionStorage.getItem("userId");
    const name = sessionStorage.getItem("userName");
    const email = sessionStorage.getItem("userEmail");

    if (userId && name && email) {
      setUser({ id: userId, name, email });
    }
  }, []);

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleProfileClick = () => {
    console.log({ user });
    if (!user.id) {
      toast.error("Please log in to view your profile.");
      setShowUserMenu(false);
    }
    navigate(`/profile`);
    setShowUserMenu(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("https://your-api-domain.com/api/v1/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });

      sessionStorage.clear();
      if (setShowUserMenu) setShowUserMenu(false);

      // Navigate to login
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally show toast/error message
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="flex justify-between items-center py-4 px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <h1
            className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent cursor-pointer hover:from-cyan-700 hover:to-blue-700 transition-all duration-200"
            onClick={() => navigate("/")}
          >
            StackIt
          </h1>
          <div className="ml-2 px-2 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full">
            <span className="text-xs font-semibold text-cyan-700">BETA</span>
          </div>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-3 relative">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-slate-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200 px-4 py-2 rounded-lg font-medium"
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4" />
            Home
          </Button>

          {/* Avatar */}
          <div className="relative">
            <Button
              variant="ghost"
              className="rounded-full p-2 hover:bg-slate-100 transition-all duration-200 relative"
              onClick={handleUserClick}
            >
              <UserCircle className="h-8 w-8 text-slate-700 hover:text-cyan-600 transition-colors duration-200" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </Button>

            {/* Dropdown */}
            {showUserMenu && (
              <Card className="absolute right-0 mt-2 w-64 shadow-xl border-0 bg-white/95 backdrop-blur-sm z-50">
                <div className="p-4 flex">
                  {/* User Info */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2 space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-slate-700 hover:text-cyan-600 hover:bg-cyan-50"
                      onClick={handleProfileClick}
                    >
                      <User className="h-4 w-4" />
                      View Profile
                    </Button>

                    {/* <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-slate-700 hover:text-cyan-600 hover:bg-cyan-50"
                      onClick={() => {
                        navigate("/my-questions");
                        setShowUserMenu(false);
                      }}
                    >
                      <BookOpen className="h-4 w-4" />
                      My Questions
                    </Button> */}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </div>
  );
}
