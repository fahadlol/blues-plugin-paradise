import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image, Video, Settings, Save } from 'lucide-react';

interface SiteSettings {
  logo: {
    url: string | null;
    alt: string;
  };
  hero_video: {
    url: string | null;
    thumbnail: string | null;
    title: string;
  };
  site_info: {
    name: string;
    description: string;
  };
}

export const SiteSettingsManager = ({ onStatsUpdate }: { onStatsUpdate: () => void }) => {
  const [settings, setSettings] = useState<SiteSettings>({
    logo: { url: null, alt: 'Blues Marketplace' },
    hero_video: { url: null, thumbnail: null, title: 'Demo Video' },
    site_info: { name: 'Blues Marketplace', description: 'Premium Minecraft Plugins' }
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({ logo: false, video: false });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const settingsData: SiteSettings = {
          logo: { url: null, alt: 'Blues Marketplace' },
          hero_video: { url: null, thumbnail: null, title: 'Demo Video' },
          site_info: { name: 'Blues Marketplace', description: 'Premium Minecraft Plugins' }
        };

        data.forEach((setting) => {
          if (setting.setting_key === 'logo') {
            settingsData.logo = setting.setting_value as any;
          } else if (setting.setting_key === 'hero_video') {
            settingsData.hero_video = setting.setting_value as any;
          } else if (setting.setting_key === 'site_info') {
            settingsData.site_info = setting.setting_value as any;
          }
        });

        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch site settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('plugin-previews')
      .upload(filePath, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('plugin-previews')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }

    setUploading(prev => ({ ...prev, logo: true }));

    try {
      const url = await uploadFile(file, 'logos');
      const newSettings = {
        ...settings,
        logo: { ...settings.logo, url }
      };
      setSettings(newSettings);
      await updateSetting('logo', newSettings.logo);

      toast({
        title: 'Success',
        description: 'Logo uploaded successfully'
      });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload logo',
        variant: 'destructive'
      });
    } finally {
      setUploading(prev => ({ ...prev, logo: false }));
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Error',
        description: 'Please upload a video file',
        variant: 'destructive'
      });
      return;
    }

    setUploading(prev => ({ ...prev, video: true }));

    try {
      const url = await uploadFile(file, 'videos');
      const newSettings = {
        ...settings,
        hero_video: { ...settings.hero_video, url }
      };
      setSettings(newSettings);
      await updateSetting('hero_video', newSettings.hero_video);

      toast({
        title: 'Success',
        description: 'Video uploaded successfully'
      });
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload video',
        variant: 'destructive'
      });
    } finally {
      setUploading(prev => ({ ...prev, video: false }));
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: key,
          setting_value: value
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  };

  const handleSiteInfoUpdate = async () => {
    setLoading(true);
    try {
      await updateSetting('site_info', settings.site_info);
      toast({
        title: 'Success',
        description: 'Site information updated successfully'
      });
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error updating site info:', error);
      toast({
        title: 'Error',
        description: 'Failed to update site information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoAltUpdate = async () => {
    try {
      await updateSetting('logo', settings.logo);
      toast({
        title: 'Success',
        description: 'Logo settings updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating logo settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update logo settings',
        variant: 'destructive'
      });
    }
  };

  const handleVideoTitleUpdate = async () => {
    try {
      await updateSetting('hero_video', settings.hero_video);
      toast({
        title: 'Success',
        description: 'Video settings updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating video settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update video settings',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div>Loading site settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Site Settings
        </h3>
        <p className="text-sm text-muted-foreground">Manage your site's branding and content</p>
      </div>

      {/* Logo Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="w-5 h-5 mr-2" />
            Logo Management
          </CardTitle>
          <CardDescription>Upload and manage your site logo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              {settings.logo.url ? (
                <div className="space-y-2">
                  <img 
                    src={settings.logo.url} 
                    alt={settings.logo.alt}
                    className="h-16 w-auto object-contain border rounded-md p-2"
                  />
                  <p className="text-sm text-muted-foreground">Current logo</p>
                </div>
              ) : (
                <div className="h-16 w-32 border-2 border-dashed border-muted-foreground/25 rounded-md flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">No logo uploaded</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo-upload">Upload New Logo</Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading.logo}
              />
              {uploading.logo && (
                <p className="text-sm text-muted-foreground">Uploading...</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="logo-alt">Logo Alt Text</Label>
            <div className="flex space-x-2">
              <Input
                id="logo-alt"
                value={settings.logo.alt}
                onChange={(e) => setSettings({
                  ...settings,
                  logo: { ...settings.logo, alt: e.target.value }
                })}
                placeholder="Alt text for accessibility"
              />
              <Button onClick={handleLogoAltUpdate} variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="w-5 h-5 mr-2" />
            Hero Video Management
          </CardTitle>
          <CardDescription>Upload and manage your homepage demo video</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              {settings.hero_video.url ? (
                <div className="space-y-2">
                  <video 
                    src={settings.hero_video.url}
                    className="h-32 w-auto object-cover border rounded-md"
                    controls
                  />
                  <p className="text-sm text-muted-foreground">Current video</p>
                </div>
              ) : (
                <div className="h-32 w-48 border-2 border-dashed border-muted-foreground/25 rounded-md flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">No video uploaded</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-upload">Upload New Video</Label>
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                disabled={uploading.video}
              />
              {uploading.video && (
                <p className="text-sm text-muted-foreground">Uploading...</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="video-title">Video Title</Label>
            <div className="flex space-x-2">
              <Input
                id="video-title"
                value={settings.hero_video.title}
                onChange={(e) => setSettings({
                  ...settings,
                  hero_video: { ...settings.hero_video, title: e.target.value }
                })}
                placeholder="Video title for accessibility"
              />
              <Button onClick={handleVideoTitleUpdate} variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
          <CardDescription>Update your site's basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              value={settings.site_info.name}
              onChange={(e) => setSettings({
                ...settings,
                site_info: { ...settings.site_info, name: e.target.value }
              })}
              placeholder="Your site name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-description">Site Description</Label>
            <Input
              id="site-description"
              value={settings.site_info.description}
              onChange={(e) => setSettings({
                ...settings,
                site_info: { ...settings.site_info, description: e.target.value }
              })}
              placeholder="Brief description of your site"
            />
          </div>

          <Button onClick={handleSiteInfoUpdate} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Site Information'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};