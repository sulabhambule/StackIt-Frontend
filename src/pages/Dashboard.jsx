import { useAuth } from '../contexts/AuthContext';
import { useChatbot } from '../contexts/ChatbotContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { BarChart3, User, LogOut, MessageCircle, Bell } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { messages } = useChatbot();

  // Calculate unread chatbot messages
  const unreadMessages = messages.filter(m => !m.isRead && m.type === 'bot').length;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">BusinessFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.name}</span>
              </div>
              {unreadMessages > 0 && (
                <div className="relative">
                  <Bell className="h-5 w-5 text-gray-500" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadMessages}
                  </Badge>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your business today.</p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Admin:</strong> {user?.isAdmin ? 'Yes' : 'No'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  View Reports
                </Button>
                <Button variant="outline" className="w-full">
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full">
                  Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm">No recent activity to display.</p>
              </CardContent>
            </Card>
          </div>

          {/* Chatbot Notification */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Chatbot</h2>
            <div className="mt-2 p-4 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                  <span className="text-gray-700 font-medium">New message from Chatbot</span>
                </div>
                {unreadMessages > 0 && (
                  <Badge variant="danger" className="rounded-full px-3 py-1 text-xs font-semibold">
                    {unreadMessages} new
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
