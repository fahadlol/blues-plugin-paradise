import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Trash2, FileText, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileManagerProps {
  pluginId: string;
  currentFilePath?: string;
  currentFileSize?: number;
  currentVersion?: number;
  onFileUpdate: (filePath: string, fileSize: number, version: number) => void;
}

export const FileManager = ({
  pluginId,
  currentFilePath,
  currentFileSize,
  currentVersion = 1,
  onFileUpdate,
}: FileManagerProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (allow common archive formats)
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/octet-stream'
    ];
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a compressed file (ZIP, RAR, 7Z, etc.)",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique filename with version
      const newVersion = currentVersion + 1;
      const fileExtension = file.name.split('.').pop();
      const fileName = `${pluginId}/v${newVersion}-${Date.now()}.${fileExtension}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('plugin-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Update plugin record with new file info
      const { error: updateError } = await supabase
        .from('plugins')
        .update({
          file_path: fileName,
          file_size: file.size,
          file_version: newVersion,
          updated_at: new Date().toISOString()
        })
        .eq('id', pluginId);

      if (updateError) throw updateError;

      // Delete old file if exists
      if (currentFilePath) {
        await supabase.storage
          .from('plugin-files')
          .remove([currentFilePath]);
      }

      onFileUpdate(fileName, file.size, newVersion);
      
      toast({
        title: "Success",
        description: `File uploaded successfully (Version ${newVersion})`
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteFile = async () => {
    if (!currentFilePath) return;

    try {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('plugin-files')
        .remove([currentFilePath]);

      if (deleteError) throw deleteError;

      // Update plugin record
      const { error: updateError } = await supabase
        .from('plugins')
        .update({
          file_path: null,
          file_size: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', pluginId);

      if (updateError) throw updateError;

      onFileUpdate('', 0, currentVersion);
      
      toast({
        title: "Success",
        description: "File deleted successfully"
      });

    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete file",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          File Management
        </CardTitle>
        <CardDescription>
          Upload and manage the downloadable files for this plugin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentFilePath ? (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium">Current File</span>
                <Badge variant="secondary">v{currentVersion}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteFile}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Size: {formatFileSize(currentFileSize)}</p>
              <p>Path: {currentFilePath}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No file uploaded yet</p>
          </div>
        )}

        <div>
          <Label htmlFor="file-upload" className="text-sm font-medium">
            {currentFilePath ? 'Upload New Version' : 'Upload Plugin File'}
          </Label>
          <div className="mt-1">
            <Input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".zip,.rar,.7z,.tar,.gz"
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Accepted formats: ZIP, RAR, 7Z, TAR, GZ (Max: 100MB)
          </p>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};