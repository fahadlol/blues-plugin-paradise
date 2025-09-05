import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DownloadManager } from '@/components/DownloadManager';

const MyDownloads = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = "My Downloads | Blues Marketplace";
  }, []);

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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">My Downloads</h1>
              <p className="text-muted-foreground">
                Access your purchased plugins and download files. Links expire after 24 hours for security.
              </p>
            </div>

            <DownloadManager />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MyDownloads;