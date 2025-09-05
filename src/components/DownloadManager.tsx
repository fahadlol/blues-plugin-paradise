import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DownloadLink {
  id: string;
  plugin_id: string;
  expires_at: string;
  downloaded_at?: string;
  plugins: {
    title: string;
    thumbnail: string;
    file_version: number;
  };
}

export const DownloadManager = () => {
  const [downloads, setDownloads] = useState<DownloadLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const { data, error } = await supabase
        .from('plugin_downloads')
        .select(`
          id,
          plugin_id,
          expires_at,
          downloaded_at,
          plugins!inner(title, thumbnail, file_version)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDownloads(data || []);
    } catch (error: any) {
      console.error('Error fetching downloads:', error);
      toast({
        title: "Error",
        description: "Failed to load your downloads",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (downloadId: string, pluginTitle: string) => {
    try {
      // Generate secure download URL
      const { data, error } = await supabase.functions.invoke('secure-download', {
        body: { download_id: downloadId }
      });

      if (error) throw error;

      if (data.download_url) {
        // Open download in new tab
        window.open(data.download_url, '_blank');
        toast({
          title: "Download Started",
          description: `Downloading ${pluginTitle}...`
        });
        
        // Refresh the downloads list
        fetchDownloads();
      }
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to start download",
        variant: "destructive"
      });
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-lg">Loading your downloads...</div>
        </CardContent>
      </Card>
    );
  }

  if (downloads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Downloads</CardTitle>
          <CardDescription>
            Your purchased plugins will appear here for download
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Download className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No downloads available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Downloads</CardTitle>
        <CardDescription>
          Download your purchased plugins (links expire after 24 hours)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {downloads.map((download) => {
            const expired = isExpired(download.expires_at);
            const downloaded = !!download.downloaded_at;

            return (
              <div
                key={download.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={download.plugins.thumbnail}
                    alt={download.plugins.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div>
                    <h4 className="font-medium">{download.plugins.title}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>Version {download.plugins.file_version}</span>
                      <span>•</span>
                      <span>
                        Expires: {new Date(download.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {expired ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Expired
                    </Badge>
                  ) : downloaded ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Downloaded
                    </Badge>
                  ) : (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Available
                    </Badge>
                  )}

                  <Button
                    variant={expired ? "secondary" : "default"}
                    size="sm"
                    disabled={expired}
                    onClick={() => handleDownload(download.id, download.plugins.title)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {expired ? "Expired" : "Download"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};