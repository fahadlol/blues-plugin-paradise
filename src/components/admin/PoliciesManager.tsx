import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Save, Eye } from "lucide-react";

interface Policy {
  id: string;
  policy_type: string;
  title: string;
  content: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PoliciesManagerProps {
  onStatsUpdate?: () => void;
}

const PoliciesManager = ({ onStatsUpdate }: PoliciesManagerProps) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  const policyTypes = [
    { key: 'privacy_policy', label: 'Privacy Policy' },
    { key: 'terms_of_service', label: 'Terms of Service' },
    { key: 'refund_policy', label: 'Refund Policy' }
  ];

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('policy_type');

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast({
        title: "Error",
        description: "Failed to load policies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePolicy = async (policyType: string, title: string, content: string) => {
    setSaving(policyType);
    try {
      const existingPolicy = policies.find(p => p.policy_type === policyType);
      
      if (existingPolicy) {
        const { error } = await supabase
          .from('policies')
          .update({
            title,
            content,
            version: existingPolicy.version + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPolicy.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('policies')
          .insert({
            policy_type: policyType,
            title,
            content
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Policy updated successfully"
      });

      fetchPolicies();
      onStatsUpdate?.();
    } catch (error) {
      console.error('Error updating policy:', error);
      toast({
        title: "Error",
        description: "Failed to update policy",
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  const PolicyEditor = ({ policyType, label }: { policyType: string; label: string }) => {
    const policy = policies.find(p => p.policy_type === policyType);
    const [title, setTitle] = useState(policy?.title || label);
    const [content, setContent] = useState(policy?.content || '');

    useEffect(() => {
      if (policy) {
        setTitle(policy.title);
        setContent(policy.content);
      }
    }, [policy]);

    const handleSave = () => {
      if (!title.trim() || !content.trim()) {
        toast({
          title: "Error",
          description: "Title and content are required",
          variant: "destructive"
        });
        return;
      }
      updatePolicy(policyType, title, content);
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <CardTitle>{label}</CardTitle>
            {policy && (
              <Badge variant="secondary">v{policy.version}</Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/policies/${policyType}`, '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving === policyType}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving === policyType ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`title-${policyType}`}>Title</Label>
            <Input
              id={`title-${policyType}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter policy title"
            />
          </div>
          <div>
            <Label htmlFor={`content-${policyType}`}>Content</Label>
            <Textarea
              id={`content-${policyType}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter policy content (Markdown supported)"
              rows={12}
              className="font-mono text-sm"
            />
          </div>
          {policy && (
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date(policy.updated_at).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Legal Policies</h2>
        <p className="text-muted-foreground">
          Manage your legal documents that users must agree to during checkout.
        </p>
      </div>

      <Tabs defaultValue="privacy_policy" className="space-y-4">
        <TabsList>
          {policyTypes.map(({ key, label }) => (
            <TabsTrigger key={key} value={key}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {policyTypes.map(({ key, label }) => (
          <TabsContent key={key} value={key}>
            <PolicyEditor policyType={key} label={label} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PoliciesManager;