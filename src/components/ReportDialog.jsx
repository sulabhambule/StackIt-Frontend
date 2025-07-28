import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Flag, AlertTriangle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { moderationAPI } from '../api/moderationService';

export default function ReportDialog({ 
  targetType, 
  targetId, 
  triggerComponent,
  title = `Report ${targetType}` 
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reasons = [
    { value: 'spam', label: 'Spam or self-promotion' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'off_topic', label: 'Off-topic or irrelevant' },
    { value: 'other', label: 'Other (please describe)' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) {
      toast({
        title: "Error",
        description: "Please select a reason for reporting",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const reportData = {
        reportType: targetType,
        targetId: targetId,
        reason: reason,
        description: description.trim()
      };

      const response = await moderationAPI.submitReport(reportData);
      
      if (response.success) {
        toast({
          title: "Report Submitted",
          description: "Thank you for helping keep our community safe. We'll review this report shortly.",
        });
        
        // Reset form and close dialog
        setReason('');
        setDescription('');
        setOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    setDescription('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerComponent || (
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Flag className="h-4 w-4 mr-1" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Help us maintain a safe and respectful community by reporting content that violates our guidelines.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for reporting *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reasonOption) => (
                  <SelectItem key={reasonOption.value} value={reasonOption.value}>
                    {reasonOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Additional details {reason === 'other' ? '(required)' : '(optional)'}
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide more details about why you're reporting this content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <div className="text-sm text-gray-500 text-right">
              {description.length}/500
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !reason || (reason === 'other' && !description.trim())}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
