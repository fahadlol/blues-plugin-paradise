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
import { Plus, Edit, Trash2, HelpCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export const FAQManager = ({ onStatsUpdate }: { onStatsUpdate: () => void }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    sort_order: '',
    is_active: true
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch FAQs',
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
      const faqData = {
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        sort_order: formData.sort_order ? parseInt(formData.sort_order) : faqs.length,
        is_active: formData.is_active
      };

      let result;
      if (editingFaq) {
        result = await supabase
          .from('faqs')
          .update(faqData)
          .eq('id', editingFaq.id);
      } else {
        result = await supabase
          .from('faqs')
          .insert([faqData]);
      }

      if (result.error) throw result.error;

      toast({
        title: 'Success',
        description: `FAQ ${editingFaq ? 'updated' : 'created'} successfully`
      });

      resetForm();
      fetchFaqs();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error saving FAQ:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save FAQ',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', faqId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'FAQ deleted successfully'
      });

      fetchFaqs();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete FAQ',
        variant: 'destructive'
      });
    }
  };

  const updateSortOrder = async (faqId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ sort_order: newOrder })
        .eq('id', faqId);

      if (error) throw error;

      fetchFaqs();
    } catch (error: any) {
      console.error('Error updating sort order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sort order',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      sort_order: '',
      is_active: true
    });
    setEditingFaq(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sort_order: faq.sort_order.toString(),
      is_active: faq.is_active
    });
    setIsDialogOpen(true);
  };

  const moveFaq = (faq: FAQ, direction: 'up' | 'down') => {
    const currentIndex = faqs.findIndex(f => f.id === faq.id);
    if (direction === 'up' && currentIndex > 0) {
      const targetFaq = faqs[currentIndex - 1];
      updateSortOrder(faq.id, targetFaq.sort_order);
      updateSortOrder(targetFaq.id, faq.sort_order);
    } else if (direction === 'down' && currentIndex < faqs.length - 1) {
      const targetFaq = faqs[currentIndex + 1];
      updateSortOrder(faq.id, targetFaq.sort_order);
      updateSortOrder(targetFaq.id, faq.sort_order);
    }
  };

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  if (loading && faqs.length === 0) {
    return <div>Loading FAQs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">FAQ Management</h3>
          <p className="text-sm text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Create New FAQ'}</DialogTitle>
              <DialogDescription>
                {editingFaq ? 'Update FAQ information' : 'Add a new frequently asked question'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="general, plugins, billing, etc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    placeholder="Display order"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the detailed answer"
                  rows={6}
                  required
                />
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
                  {loading ? 'Saving...' : editingFaq ? 'Update FAQ' : 'Create FAQ'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {categories.map(category => {
          const categoryFaqs = faqs.filter(faq => faq.category === category);
          
          return (
            <div key={category} className="space-y-2">
              <h4 className="text-lg font-semibold capitalize mb-3">{category}</h4>
              <div className="grid grid-cols-1 gap-3">
                {categoryFaqs.map((faq, index) => (
                  <Card key={faq.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center">
                            <HelpCircle className="w-4 h-4 mr-2" />
                            {faq.question}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={faq.is_active ? 'default' : 'secondary'}>
                              {faq.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">
                              Order: {faq.sort_order}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveFaq(faq, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveFaq(faq, 'down')}
                            disabled={index === categoryFaqs.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {faq.answer}
                      </p>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(faq)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(faq.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {faqs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No FAQs found</h3>
            <p className="text-muted-foreground mb-4">Create your first FAQ to get started</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create FAQ
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};