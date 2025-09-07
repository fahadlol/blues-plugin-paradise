import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Package, Star } from 'lucide-react';

interface Bundle {
  id: string;
  name: string;
  description: string;
  price: number;
  plugin_ids: string[];
  features: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

interface Plugin {
  id: string;
  title: string;
  price: number;
}

export const BundlesManager = ({ onStatsUpdate }: { onStatsUpdate: () => void }) => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    plugin_ids: [] as string[],
    features: '',
    is_featured: false,
    is_active: true
  });

  useEffect(() => {
    fetchBundles();
    fetchPlugins();
  }, []);

  const fetchBundles = async () => {
    try {
      const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBundles((data || []) as Bundle[]);
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch bundles',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlugins = async () => {
    try {
      const { data, error } = await supabase
        .from('plugins')
        .select('id, title, price')
        .eq('is_active', true);

      if (error) throw error;
      setPlugins(data || []);
    } catch (error) {
      console.error('Error fetching plugins:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bundleData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        plugin_ids: formData.plugin_ids,
        features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : [],
        is_featured: formData.is_featured,
        is_active: formData.is_active
      };

      let result;
      if (editingBundle) {
        result = await supabase
          .from('bundles')
          .update(bundleData)
          .eq('id', editingBundle.id);
      } else {
        result = await supabase
          .from('bundles')
          .insert([bundleData]);
      }

      if (result.error) throw result.error;

      toast({
        title: 'Success',
        description: `Bundle ${editingBundle ? 'updated' : 'created'} successfully`
      });

      resetForm();
      fetchBundles();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error saving bundle:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save bundle',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bundleId: string) => {
    if (!confirm('Are you sure you want to delete this bundle?')) return;

    try {
      const { error } = await supabase
        .from('bundles')
        .delete()
        .eq('id', bundleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Bundle deleted successfully'
      });

      fetchBundles();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error deleting bundle:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bundle',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      plugin_ids: [],
      features: '',
      is_featured: false,
      is_active: true
    });
    setEditingBundle(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (bundle: Bundle) => {
    setEditingBundle(bundle);
    setFormData({
      name: bundle.name,
      description: bundle.description || '',
      price: bundle.price.toString(),
      plugin_ids: bundle.plugin_ids,
      features: Array.isArray(bundle.features) ? bundle.features.join('\n') : '',
      is_featured: bundle.is_featured,
      is_active: bundle.is_active
    });
    setIsDialogOpen(true);
  };

  const handlePluginSelection = (pluginId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      plugin_ids: checked 
        ? [...prev.plugin_ids, pluginId]
        : prev.plugin_ids.filter(id => id !== pluginId)
    }));
  };

  if (loading && bundles.length === 0) {
    return <div>Loading bundles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Bundles Management</h3>
          <p className="text-sm text-muted-foreground">Create and manage plugin bundles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Bundle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBundle ? 'Edit Bundle' : 'Create New Bundle'}</DialogTitle>
              <DialogDescription>
                {editingBundle ? 'Update bundle information' : 'Add a new bundle to your marketplace'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Bundle Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter bundle name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
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
                  placeholder="Enter bundle description"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Select Plugins</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-4">
                  {plugins.map((plugin) => (
                    <div key={plugin.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={plugin.id}
                        checked={formData.plugin_ids.includes(plugin.id)}
                        onCheckedChange={(checked) => handlePluginSelection(plugin.id, checked as boolean)}
                      />
                      <label htmlFor={plugin.id} className="text-sm cursor-pointer flex-1">
                        {plugin.title} (${plugin.price})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked as boolean })}
                  />
                  <Label htmlFor="is_featured">Featured Bundle</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingBundle ? 'Update Bundle' : 'Create Bundle'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bundles.map((bundle) => (
          <Card key={bundle.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    {bundle.name}
                    {bundle.is_featured && <Star className="w-4 h-4 ml-2 text-yellow-500" />}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={bundle.is_active ? 'default' : 'secondary'}>
                      {bundle.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-lg font-bold text-primary">${bundle.price}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                {bundle.description || 'No description provided'}
              </CardDescription>
              
              <div className="space-y-2 text-sm">
                <p><strong>Plugins:</strong> {bundle.plugin_ids?.length || 0}</p>
                <p><strong>Features:</strong> {Array.isArray(bundle.features) ? bundle.features.length : 0}</p>
                <p><strong>Created:</strong> {new Date(bundle.created_at).toLocaleDateString()}</p>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(bundle)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(bundle.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bundles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bundles found</h3>
            <p className="text-muted-foreground mb-4">Create your first bundle to get started</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Bundle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};