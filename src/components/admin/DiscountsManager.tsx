import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Percent, Calendar, Target } from 'lucide-react';

interface Discount {
  id: string;
  code: string;
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  applies_to: 'all' | 'plugins' | 'bundles' | 'specific';
  target_ids: string[];
  is_active: boolean;
  created_at: string;
}

export const DiscountsManager = ({ onStatsUpdate }: { onStatsUpdate: () => void }) => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_amount: '',
    max_uses: '',
    valid_from: '',
    valid_until: '',
    applies_to: 'all' as 'all' | 'plugins' | 'bundles' | 'specific',
    target_ids: [] as string[],
    is_active: true
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscounts((data || []) as Discount[]);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch discounts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const discountData = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_amount: formData.min_amount ? parseFloat(formData.min_amount) : 0,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from || new Date().toISOString(),
        valid_until: formData.valid_until || null,
        applies_to: formData.applies_to,
        target_ids: formData.target_ids,
        is_active: formData.is_active
      };

      let result;
      if (editingDiscount) {
        result = await supabase
          .from('discounts')
          .update(discountData)
          .eq('id', editingDiscount.id);
      } else {
        result = await supabase
          .from('discounts')
          .insert([discountData]);
      }

      if (result.error) throw result.error;

      toast({
        title: 'Success',
        description: `Discount ${editingDiscount ? 'updated' : 'created'} successfully`
      });

      resetForm();
      fetchDiscounts();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error saving discount:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save discount',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (discountId: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) return;

    try {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', discountId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Discount deleted successfully'
      });

      fetchDiscounts();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error deleting discount:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete discount',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_amount: '',
      max_uses: '',
      valid_from: '',
      valid_until: '',
      applies_to: 'all',
      target_ids: [],
      is_active: true
    });
    setEditingDiscount(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      name: discount.name,
      description: discount.description || '',
      discount_type: discount.discount_type,
      discount_value: discount.discount_value.toString(),
      min_amount: discount.min_amount.toString(),
      max_uses: discount.max_uses?.toString() || '',
      valid_from: discount.valid_from ? new Date(discount.valid_from).toISOString().split('T')[0] : '',
      valid_until: discount.valid_until ? new Date(discount.valid_until).toISOString().split('T')[0] : '',
      applies_to: discount.applies_to,
      target_ids: discount.target_ids,
      is_active: discount.is_active
    });
    setIsDialogOpen(true);
  };

  const isExpired = (discount: Discount) => {
    if (!discount.valid_until) return false;
    return new Date(discount.valid_until) < new Date();
  };

  const isMaxUsesReached = (discount: Discount) => {
    if (!discount.max_uses) return false;
    return discount.used_count >= discount.max_uses;
  };

  if (loading && discounts.length === 0) {
    return <div>Loading discounts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Discounts Management</h3>
          <p className="text-sm text-muted-foreground">Create and manage discount codes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDiscount ? 'Edit Discount' : 'Create New Discount'}</DialogTitle>
              <DialogDescription>
                {editingDiscount ? 'Update discount information' : 'Add a new discount code'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Discount Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="20% Off"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter discount description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <Select value={formData.discount_type} onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, discount_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                    min="0"
                    max={formData.discount_type === 'percentage' ? '100' : undefined}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder={formData.discount_type === 'percentage' ? '20' : '10.00'}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_amount">Minimum Amount ($)</Label>
                  <Input
                    id="min_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_uses">Max Uses (optional)</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Valid From</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Valid Until (optional)</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applies_to">Applies To</Label>
                <Select value={formData.applies_to} onValueChange={(value: any) => setFormData({ ...formData, applies_to: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="plugins">Plugins Only</SelectItem>
                    <SelectItem value="bundles">Bundles Only</SelectItem>
                    <SelectItem value="specific">Specific Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingDiscount ? 'Update Discount' : 'Create Discount'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {discounts.map((discount) => (
          <Card key={discount.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    <Percent className="w-5 h-5 mr-2" />
                    {discount.code}
                  </CardTitle>
                  <CardDescription>{discount.name}</CardDescription>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={discount.is_active ? 'default' : 'secondary'}>
                      {discount.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {isExpired(discount) && <Badge variant="destructive">Expired</Badge>}
                    {isMaxUsesReached(discount) && <Badge variant="destructive">Max Uses Reached</Badge>}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Value:</strong> {discount.discount_type === 'percentage' ? `${discount.discount_value}%` : `$${discount.discount_value}`}</p>
                <p><strong>Min Amount:</strong> ${discount.min_amount}</p>
                <p><strong>Uses:</strong> {discount.used_count}{discount.max_uses ? ` / ${discount.max_uses}` : ' (unlimited)'}</p>
                <p><strong>Applies To:</strong> {discount.applies_to.replace('_', ' ')}</p>
                {discount.valid_until && (
                  <p className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <strong>Expires:</strong> {new Date(discount.valid_until).toLocaleDateString()}
                  </p>
                )}
                {discount.description && <p>{discount.description}</p>}
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(discount)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(discount.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {discounts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Percent className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No discounts found</h3>
            <p className="text-muted-foreground mb-4">Create your first discount to get started</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Discount
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};