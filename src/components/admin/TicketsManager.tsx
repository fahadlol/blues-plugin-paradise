import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Clock, CheckCircle, AlertCircle, User, Calendar, MessageSquare } from 'lucide-react';

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

export const TicketsManager = ({ onStatsUpdate }: { onStatsUpdate: () => void }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data || []) as SupportTicket[]);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tickets',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Ticket status updated successfully'
      });

      fetchTickets();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to update ticket status',
        variant: 'destructive'
      });
    }
  };

  const updateTicketPriority = async (ticketId: string, priority: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ priority })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Ticket priority updated successfully'
      });

      fetchTickets();
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to update ticket priority',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  const openTicketDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResponseMessage('');
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div>Loading tickets...</div>;
  }

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Support Tickets</h3>
          <p className="text-sm text-muted-foreground">Manage customer support requests</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>Open: {openTickets}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>In Progress: {inProgressTickets}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Resolved: {resolvedTickets}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openTicketDialog(ticket)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    {getStatusIcon(ticket.status)}
                    <span className="ml-2">{ticket.subject}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <User className="w-4 h-4 mr-1" />
                    {ticket.profiles?.full_name || ticket.profiles?.email || 'Unknown User'}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(ticket.priority) as any}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant={getStatusColor(ticket.status) as any}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {tickets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
            <p className="text-muted-foreground">All caught up! No support tickets to review.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedTicket && getStatusIcon(selectedTicket.status)}
              <span className="ml-2">{selectedTicket?.subject}</span>
            </DialogTitle>
            <DialogDescription>
              Ticket from {selectedTicket?.profiles?.full_name || selectedTicket?.profiles?.email || 'Unknown User'}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={selectedTicket.status} 
                    onValueChange={(value) => updateTicketStatus(selectedTicket.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={selectedTicket.priority} 
                    onValueChange={(value) => updateTicketPriority(selectedTicket.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end space-x-2">
                  <Badge variant={getPriorityColor(selectedTicket.priority) as any}>
                    {selectedTicket.priority}
                  </Badge>
                  <Badge variant={getStatusColor(selectedTicket.status) as any}>
                    {selectedTicket.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Original Message</Label>
                  <Card className="mt-2">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>{selectedTicket.profiles?.full_name || selectedTicket.profiles?.email}</span>
                        <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response">Staff Response (Future Feature)</Label>
                  <Textarea
                    id="response"
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Type your response here... (This will be implemented in a future update)"
                    rows={4}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Note: Response functionality will be added in future updates. For now, you can update the status and priority.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                  disabled={selectedTicket.status === 'resolved'}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Resolved
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};