import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Plus } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  items: any;
  customer_info: any;
  created_at: string;
  updated_at: string;
}

interface OrdersManagerProps {
  onStatsUpdate: () => void;
}

export function OrdersManager({ onStatsUpdate }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [orderForm, setOrderForm] = useState({
    status: 'pending',
    total_amount: '',
    customer_info: {
      name: '',
      email: '',
      phone: '',
    },
    items: [],
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const orderData = {
        status: orderForm.status,
        total_amount: parseFloat(orderForm.total_amount),
        customer_info: orderForm.customer_info,
        items: orderForm.items,
      };

      if (editingOrder) {
        const { error } = await supabase
          .from('orders')
          .update(orderData)
          .eq('id', editingOrder.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Order updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('orders')
          .insert([orderData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Order created successfully",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchOrders();
      onStatsUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setOrderForm({
      status: order.status,
      total_amount: order.total_amount.toString(),
      customer_info: order.customer_info,
      items: order.items,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
      
      fetchOrders();
      onStatsUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setOrderForm({
      status: 'pending',
      total_amount: '',
      customer_info: { name: '', email: '', phone: '' },
      items: [],
    });
    setEditingOrder(null);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-4">Loading orders...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Orders Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? 'Edit Order' : 'Add New Order'}
              </DialogTitle>
              <DialogDescription>
                {editingOrder ? 'Update order details' : 'Create a new order'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={orderForm.status} onValueChange={(value) => setOrderForm({ ...orderForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="total_amount">Total Amount</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  value={orderForm.total_amount}
                  onChange={(e) => setOrderForm({ ...orderForm, total_amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={orderForm.customer_info.name}
                  onChange={(e) => setOrderForm({
                    ...orderForm,
                    customer_info: { ...orderForm.customer_info, name: e.target.value }
                  })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customer_email">Customer Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={orderForm.customer_info.email}
                  onChange={(e) => setOrderForm({
                    ...orderForm,
                    customer_info: { ...orderForm.customer_info, email: e.target.value }
                  })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customer_phone">Customer Phone</Label>
                <Input
                  id="customer_phone"
                  value={orderForm.customer_info.phone}
                  onChange={(e) => setOrderForm({
                    ...orderForm,
                    customer_info: { ...orderForm.customer_info, phone: e.target.value }
                  })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingOrder ? 'Update Order' : 'Create Order'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No orders found. Create your first order to get started.
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer_info?.name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{order.customer_info?.email || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(order)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(order.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}