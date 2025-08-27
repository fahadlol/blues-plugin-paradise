import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Eye, Star, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Plugin {
  id: string;
  title: string;
  description: string;
  content: string;
  price: number;
  rating: number;
  downloads: number;
  thumbnail: string;
  category: string;
  features: string[];
  requirements: any;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

interface PluginsManagerProps {
  onStatsUpdate?: () => void;
}

const PluginsManager = ({ onStatsUpdate }: PluginsManagerProps) => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlugin, setEditingPlugin] = useState<Plugin | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    price: 0,
    category: '',
    thumbnail: '',
    features: '',
    requirements: '',
    is_featured: false,
    is_active: true
  });

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const formattedData = (data || []).map(plugin => ({
        ...plugin,
        features: Array.isArray(plugin.features) ? plugin.features as string[] : []
      }));
      setPlugins(formattedData);
      onStatsUpdate?.();
    } catch (error) {
      console.error('Error fetching plugins:', error);
      toast({
        title: "Error",
        description: "Failed to fetch plugins",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const pluginData = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        requirements: formData.requirements ? JSON.parse(formData.requirements) : {},
      };

      if (editingPlugin) {
        const { error } = await supabase
          .from('plugins')
          .update(pluginData)
          .eq('id', editingPlugin.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Plugin updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('plugins')
          .insert([pluginData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Plugin created successfully"
        });
      }

      setIsDialogOpen(false);
      setEditingPlugin(null);
      resetForm();
      fetchPlugins();
    } catch (error: any) {
      console.error('Error saving plugin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save plugin",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (plugin: Plugin) => {
    setEditingPlugin(plugin);
    setFormData({
      title: plugin.title,
      description: plugin.description,
      content: plugin.content,
      price: plugin.price,
      category: plugin.category,
      thumbnail: plugin.thumbnail || '',
      features: plugin.features?.join(', ') || '',
      requirements: JSON.stringify(plugin.requirements || {}, null, 2),
      is_featured: plugin.is_featured,
      is_active: plugin.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('plugins')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Plugin deleted successfully"
      });
      fetchPlugins();
    } catch (error: any) {
      console.error('Error deleting plugin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete plugin",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      price: 0,
      category: '',
      thumbnail: '',
      features: '',
      requirements: '',
      is_featured: false,
      is_active: true
    });
  };

  const openNewDialog = () => {
    setEditingPlugin(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading plugins...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plugins Management</h2>
          <p className="text-muted-foreground">Manage all plugins in your marketplace</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Plugin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlugin ? 'Edit Plugin' : 'Add New Plugin'}</DialogTitle>
              <DialogDescription>
                {editingPlugin ? 'Update the plugin details' : 'Create a new plugin for your marketplace'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Full Content</Label>
                <Textarea
                  id="content"
                  className="min-h-[200px]"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Full plugin description with markdown support..."
                />
              </div>

              <div>
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Input
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Feature 1, Feature 2, Feature 3"
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements (JSON)</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder='{"minecraft_version": "1.16+", "server_type": "Paper", "ram": "2GB+", "players": "Unlimited"}'
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="featured">Featured Plugin</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPlugin ? 'Update' : 'Create'} Plugin
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Plugins ({plugins.length})</CardTitle>
          <CardDescription>
            Manage your plugin inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plugin</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plugins.map((plugin) => (
                <TableRow key={plugin.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img 
                        src={plugin.thumbnail} 
                        alt={plugin.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <div className="font-medium">{plugin.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-2">
                          <Star className="w-3 h-3 fill-current text-gaming-orange" />
                          <span>{plugin.rating}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{plugin.category}</Badge>
                  </TableCell>
                  <TableCell>${plugin.price}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>{plugin.downloads.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant={plugin.is_active ? "default" : "secondary"}>
                        {plugin.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {plugin.is_featured && (
                        <Badge variant="outline" className="text-gaming-orange border-gaming-orange">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/plugin/${plugin.id}`, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(plugin)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Plugin</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{plugin.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(plugin.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginsManager;