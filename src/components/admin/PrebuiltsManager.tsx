import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Plus } from 'lucide-react';

interface CustomPrebuilt {
  id: string;
  name: string;
  description: string;
  components: any;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PrebuiltsManagerProps {
  onStatsUpdate: () => void;
}

export function PrebuiltsManager({ onStatsUpdate }: PrebuiltsManagerProps) {
  const [prebuilts, setPrebuilts] = useState<CustomPrebuilt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrebuilt, setEditingPrebuilt] = useState<CustomPrebuilt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [prebuiltForm, setPrebuiltForm] = useState({
    name: '',
    description: '',
    price: '',
    is_active: true,
    components: '[]',
  });

  useEffect(() => {
    fetchPrebuilts();
  }, []);

  const fetchPrebuilts = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_prebuilts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrebuilts(data || []);
    } catch (error) {
      console.error('Error fetching prebuilts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch custom prebuilts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let components;
      try {
        components = JSON.parse(prebuiltForm.components);
      } catch {
        throw new Error('Invalid JSON format for components');
      }

      const prebuiltData = {
        name: prebuiltForm.name,
        description: prebuiltForm.description,
        price: parseFloat(prebuiltForm.price),
        is_active: prebuiltForm.is_active,
        components,
      };

      if (editingPrebuilt) {
        const { error } = await supabase
          .from('custom_prebuilts')
          .update(prebuiltData)
          .eq('id', editingPrebuilt.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Custom prebuilt updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('custom_prebuilts')
          .insert([prebuiltData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Custom prebuilt created successfully",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchPrebuilts();
      onStatsUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (prebuilt: CustomPrebuilt) => {
    setEditingPrebuilt(prebuilt);
    setPrebuiltForm({
      name: prebuilt.name,
      description: prebuilt.description || '',
      price: prebuilt.price.toString(),
      is_active: prebuilt.is_active,
      components: JSON.stringify(prebuilt.components, null, 2),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (prebuiltId: string) => {
    if (!confirm('Are you sure you want to delete this custom prebuilt?')) return;

    try {
      const { error } = await supabase
        .from('custom_prebuilts')
        .delete()
        .eq('id', prebuiltId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Custom prebuilt deleted successfully",
      });
      
      fetchPrebuilts();
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
    setPrebuiltForm({
      name: '',
      description: '',
      price: '',
      is_active: true,
      components: '[]',
    });
    setEditingPrebuilt(null);
  };

  if (loading) {
    return <div className="text-center py-4">Loading custom prebuilts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Custom Prebuilts Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Prebuilt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPrebuilt ? 'Edit Custom Prebuilt' : 'Add New Custom Prebuilt'}
              </DialogTitle>
              <DialogDescription>
                {editingPrebuilt ? 'Update prebuilt details' : 'Create a new custom prebuilt configuration'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={prebuiltForm.name}
                  onChange={(e) => setPrebuiltForm({ ...prebuiltForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={prebuiltForm.description}
                  onChange={(e) => setPrebuiltForm({ ...prebuiltForm, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={prebuiltForm.price}
                  onChange={(e) => setPrebuiltForm({ ...prebuiltForm, price: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={prebuiltForm.is_active}
                  onCheckedChange={(checked) => setPrebuiltForm({ ...prebuiltForm, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div>
                <Label htmlFor="components">Components (JSON)</Label>
                <Textarea
                  id="components"
                  value={prebuiltForm.components}
                  onChange={(e) => setPrebuiltForm({ ...prebuiltForm, components: e.target.value })}
                  rows={8}
                  placeholder='[{"name": "CPU", "model": "Intel i7", "price": 300}]'
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter component data as JSON array. Each component should have name, model, and price fields.
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingPrebuilt ? 'Update Prebuilt' : 'Create Prebuilt'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {prebuilts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No custom prebuilts found. Create your first prebuilt to get started.
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prebuilts.map((prebuilt) => (
                <TableRow key={prebuilt.id}>
                  <TableCell className="font-medium">{prebuilt.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {prebuilt.description || 'No description'}
                  </TableCell>
                  <TableCell>${prebuilt.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={prebuilt.is_active ? "default" : "secondary"}>
                      {prebuilt.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(prebuilt.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(prebuilt)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(prebuilt.id)}
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