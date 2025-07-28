import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle,
  Ban,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { moderationAPI } from '../api/moderationService';
import { useToast } from '../hooks/use-toast';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [dashboardData, setDashboardData] = useState({
    pendingReports: 0,
    totalReports: 0,
    recentReports: []
  });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [processingReport, setProcessingReport] = useState(null);

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    
    loadDashboardData();
    loadReports();
  }, [isAuthenticated, user, navigate]);

  const loadDashboardData = async () => {
    try {
      const response = await moderationAPI.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  const loadReports = async (status = 'pending') => {
    try {
      setLoading(true);
      const response = await moderationAPI.getReports({ status });
      if (response.success) {
        setReports(response.data.reports || []);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewReport = async (reportId, action) => {
    try {
      setProcessingReport(reportId);
      const response = await moderationAPI.reviewReport(reportId, { action });
      
      if (response.success) {
        toast({
          title: "Success",
          description: `Report ${action.replace('_', ' ')} successfully`,
        });
        
        // Reload data
        await loadDashboardData();
        await loadReports(selectedStatus);
      }
    } catch (error) {
      console.error('Failed to process report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process report",
        variant: "destructive",
      });
    } finally {
      setProcessingReport(null);
    }
  };

  const getReasonBadgeColor = (reason) => {
    const colors = {
      spam: 'bg-red-100 text-red-800',
      inappropriate: 'bg-orange-100 text-orange-800',
      off_topic: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[reason] || colors.other;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stripHtmlTags = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Content moderation and user management</p>
            </div>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.pendingReports}
              </div>
              <p className="text-xs text-gray-600">Need immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData.totalReports}
              </div>
              <p className="text-xs text-gray-600">All time reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                size="sm" 
                className="w-full" 
                onClick={() => setSelectedStatus('pending')}
              >
                Review Pending Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Reports Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Reports Management</CardTitle>
              <div className="flex space-x-2">
                {['pending', 'resolved', 'dismissed', 'all'].map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={selectedStatus === status ? "default" : "outline"}
                    onClick={() => {
                      setSelectedStatus(status);
                      loadReports(status);
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reports found for the selected filter.
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report._id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={getReasonBadgeColor(report.reason)}>
                          {report.reason.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusBadgeColor(report.status)}>
                          {report.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {report.reportType === 'question' ? 'Question' : 'Answer'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Content:</strong> 
                        {report.reportType === 'question' ? (
                          <div className="mt-1 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                            <div className="font-medium text-blue-800">
                              📝 Question: {report.targetContent?.title || 'Question title not available'}
                            </div>
                            {report.targetContent?.description && (
                              <div className="mt-2 text-gray-700 text-sm">
                                <strong>Description:</strong>
                                <div className="mt-1 max-h-20 overflow-y-auto">
                                  {stripHtmlTags(report.targetContent.description).substring(0, 300)}
                                  {stripHtmlTags(report.targetContent.description).length > 300 ? '...' : ''}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-1 p-3 bg-green-50 border-l-4 border-green-400 rounded">
                            <div className="font-medium text-green-800">
                              💬 Answer Content:
                            </div>
                            <div className="mt-1 text-gray-700 text-sm max-h-20 overflow-y-auto">
                              {report.targetContent?.content ? 
                                stripHtmlTags(report.targetContent.content).substring(0, 300) + 
                                (stripHtmlTags(report.targetContent.content).length > 300 ? '...' : '') 
                                : 'Answer content not available'
                              }
                            </div>
                            {report.targetContent?.question?.title && (
                              <div className="mt-2 text-gray-600 text-xs">
                                <strong>For question:</strong> {report.targetContent.question.title}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {report.description && (
                        <div className="mt-3 p-2 bg-yellow-50 border rounded">
                          <p className="text-sm text-gray-700">
                            <strong>🚨 Report Reason:</strong> {report.description}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        <div>
                          <strong>Reported by:</strong> {report.reportedBy?.name || 'Unknown'} ({report.reportedBy?.email || 'No email'})
                        </div>
                        <div>
                          <strong>Content owner:</strong> {report.contentOwner?.name || 'Unknown'} ({report.contentOwner?.email || 'No email'})
                        </div>
                      </div>
                      
                      {report.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReviewReport(report._id, 'dismissed')}
                            disabled={processingReport === report._id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReviewReport(report._id, 'content_deleted')}
                            disabled={processingReport === report._id}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete Content
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReviewReport(report._id, 'user_banned')}
                            disabled={processingReport === report._id}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Ban User
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
