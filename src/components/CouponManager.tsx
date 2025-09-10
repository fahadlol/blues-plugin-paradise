import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount?: number;
  max_uses?: number;
  used_count: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  applies_to: 'all' | 'specific';
  target_ids: string[];
}

interface CouponManagerProps {
  onUpdate?: () => void;
}

export const CouponManager = ({ onUpdate }: CouponManagerProps) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_amount: 0,
    max_uses: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    is_active: true,
    applies_to: 'all' as 'all' | 'specific',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data?.map(item => ({
        ...item,
        discount_type: item.discount_type as 'percentage' | 'fixed',
        applies_to: item.applies_to as 'all' | 'specific',
        target_ids: Array.isArray(item.target_ids) ? item.target_ids as string[] : []
      })) || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        min_amount: formData.min_amount || null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until || null,
        is_active: formData.is_active,
        applies_to: formData.applies_to,
        target_ids: []
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from('discounts')
          .update(couponData)
          .eq('id', editingCoupon.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Coupon updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('discounts')
          .insert(couponData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Coupon created successfully"
        });
      }

      setIsOpen(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save coupon",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Are you sure you want to delete the coupon "${coupon.code}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', coupon.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coupon deleted successfully"
      });
      
      fetchCoupons();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete coupon",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_amount: coupon.min_amount || 0,
      max_uses: coupon.max_uses?.toString() || '',
      valid_from: coupon.valid_from.split('T')[0],
      valid_until: coupon.valid_until?.split('T')[0] || '',
      is_active: coupon.is_active,
      applies_to: coupon.applies_to,
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_amount: 0,
      max_uses: '',
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      is_active: true,
      applies_to: 'all',
    });
  };

  const openCreateDialog = () => {
    setEditingCoupon(null);
    resetForm();
    setIsOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading coupons...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Coupons</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </DialogTitle>
              <DialogDescription>
                {editingCoupon ? 'Update coupon details' : 'Create a new discount coupon for customers'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE20"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="20% Off Sale"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Save 20% on all purchases"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setFormData({ ...formData, discount_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discount_value">
                    Discount Value {formData.discount_type === 'percentage' ? '(%)' : '($)'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_amount">Minimum Order Amount ($)</Label>
                  <Input
                    id="min_amount"
                    type="number"
                    step="0.01"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="max_uses">Maximum Uses (optional)</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valid_from">Valid From</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valid_until">Valid Until (optional)</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {coupons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No coupons found. Create your first coupon to get started.
          </div>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="font-mono">
                        {coupon.code}
                      </Badge>
                      <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <h4 className="font-medium">{coupon.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}% off`
                        : `$${coupon.discount_value} off`
                      }
                      {coupon.min_amount && ` (min. $${coupon.min_amount})`}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Uses: {coupon.used_count}{coupon.max_uses && ` / ${coupon.max_uses}`}
                      {coupon.valid_until && ` • Expires: ${new Date(coupon.valid_until).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(coupon)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(coupon)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};