import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Policy {
  id: string;
  policy_type: string;
  title: string;
  content: string;
  version: number;
  updated_at: string;
}

const PolicyPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  const policyTitles: Record<string, string> = {
    'privacy_policy': 'Privacy Policy',
    'terms_of_service': 'Terms of Service',
    'refund_policy': 'Refund Policy'
  };

  useEffect(() => {
    if (!type || !policyTitles[type]) {
      navigate('/404');
      return;
    }

    document.title = `${policyTitles[type]} | Blues Marketplace`;
    fetchPolicy();
  }, [type]);

  const fetchPolicy = async () => {
    if (!type) return;

    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('policy_type', type)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setPolicy(data);
    } catch (error) {
      console.error('Error fetching policy:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <h3 key={index} className="font-semibold text-lg mt-6 mb-2">
              {line.slice(2, -2)}
            </h3>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <li key={index} className="ml-4 mb-1">
              {line.slice(2)}
            </li>
          );
        }
        if (line.match(/^\d+\./)) {
          return (
            <li key={index} className="ml-4 mb-1 list-decimal">
              {line.replace(/^\d+\.\s*/, '')}
            </li>
          );
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return (
          <p key={index} className="mb-3 leading-relaxed">
            {line}
          </p>
        );
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Policy Not Found</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6" />
                    <CardTitle className="text-2xl">{policy.title}</CardTitle>
                  </div>
                  <Badge variant="secondary">Version {policy.version}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(policy.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardHeader>
              <CardContent>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  {formatContent(policy.content)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PolicyPage;