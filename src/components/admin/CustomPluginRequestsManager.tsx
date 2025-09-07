import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Code, Clock, CheckCircle, AlertCircle, User, Calendar, DollarSign, FileText } from 'lucide-react';

interface CustomPluginRequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  server_type: string;
  description: string;
  budget_range: string;
  status: 'pending' | 'reviewed' | 'in_progress' | 'completed' | 'rejected';
  assigned_to: string | null;
  estimated_price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const CustomPluginRequestsManager = ({ onStatsUpdate }: { onStatsUpdate: () => void }) => {
  const [requests, setRequests] = useState<CustomPluginRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CustomPluginRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_plugin_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as CustomPluginRequest[]);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('custom_plugin_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Request status updated successfully'
      });

      fetchRequests();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request status',
        variant: 'destructive'
      });
    }
  };

  const updateRequestDetails = async () => {
    if (!selectedRequest) return;

    try {
      const updates: any = { notes };
      
      if (estimatedPrice && !isNaN(parseFloat(estimatedPrice))) {
        updates.estimated_price = parseFloat(estimatedPrice);
      }

      const { error } = await supabase
        .from('custom_plugin_requests')
        .update(updates)
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Request details updated successfully'
      });

      fetchRequests();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating request details:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request details',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'reviewed': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'reviewed': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  const openRequestDialog = (request: CustomPluginRequest) => {
    setSelectedRequest(request);
    setNotes(request.notes || '');
    setEstimatedPrice(request.estimated_price?.toString() || '');
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div>Loading requests...</div>;
  }

  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const inProgressRequests = requests.filter(r => r.status === 'in_progress').length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Custom Plugin Requests</h3>
          <p className="text-sm text-muted-foreground">Manage custom plugin development requests</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span>Pending: {pendingRequests}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>In Progress: {inProgressRequests}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Completed: {completedRequests}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openRequestDialog(request)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    {getStatusIcon(request.status)}
                    <span className="ml-2">Custom Plugin Request</span>
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <User className="w-4 h-4 mr-1" />
                    {request.name} ({request.email})
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant={getStatusColor(request.status) as any}>
                    {request.status.replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(request.created_at).toLocaleDateString()}
                  </div>
                  {request.estimated_price && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <DollarSign className="w-3 h-3 mr-1" />
                      ${request.estimated_price}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Server Type:</strong> {request.server_type}</p>
                <p><strong>Budget Range:</strong> {request.budget_range}</p>
                <p className="line-clamp-2"><strong>Description:</strong> {request.description}</p>
                {request.notes && <p className="line-clamp-1"><strong>Notes:</strong> {request.notes}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No requests found</h3>
            <p className="text-muted-foreground">Custom plugin requests will appear here when submitted.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedRequest && getStatusIcon(selectedRequest.status)}
              <span className="ml-2">Custom Plugin Request Details</span>
            </DialogTitle>
            <DialogDescription>
              Request from {selectedRequest?.name} ({selectedRequest?.email})
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={selectedRequest.status} 
                    onValueChange={(value) => updateRequestStatus(selectedRequest.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end space-x-2">
                  <Badge variant={getStatusColor(selectedRequest.status) as any}>
                    {selectedRequest.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Request Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Server Type</Label>
                      <p className="text-sm">{selectedRequest.server_type}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Budget Range</Label>
                      <p className="text-sm">{selectedRequest.budget_range}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Submitted</Label>
                      <p className="text-sm">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="estimated_price">Estimated Price ($)</Label>
                      <Input
                        id="estimated_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={estimatedPrice}
                        onChange={(e) => setEstimatedPrice(e.target.value)}
                        placeholder="Enter estimated price"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Description</Label>
                  <Card className="mt-2">
                    <CardContent className="pt-4">
                      <p className="whitespace-pre-wrap">{selectedRequest.description}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add internal notes about this request..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={updateRequestDetails}>
                  <FileText className="w-4 h-4 mr-2" />
                  Update Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};