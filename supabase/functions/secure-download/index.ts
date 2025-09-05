import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const downloadToken = url.pathname.split('/').pop();
    
    if (!downloadToken || !downloadToken.includes('::')) {
      throw new Error("Invalid download token");
    }

    const [downloadId, secureToken] = downloadToken.split('::');

    // Create Supabase clients
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify download link
    const { data: downloadData, error: downloadError } = await supabaseService
      .from('plugin_downloads')
      .select(`
        *,
        plugins!inner(file_path, title),
        orders!inner(customer_id, status)
      `)
      .eq('id', downloadId)
      .eq('download_url', secureToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (downloadError || !downloadData) {
      throw new Error("Invalid or expired download link");
    }

    // Verify payment status
    if (downloadData.orders.status !== 'paid') {
      throw new Error("Payment verification failed");
    }

    const plugin = downloadData.plugins;
    if (!plugin.file_path) {
      throw new Error("No file available for this plugin");
    }

    // Get file from storage
    const { data: fileData, error: fileError } = await supabaseService.storage
      .from('plugin-files')
      .download(plugin.file_path);

    if (fileError || !fileData) {
      throw new Error("File not found or access denied");
    }

    // Update download record
    await supabaseService
      .from('plugin_downloads')
      .update({
        downloaded_at: new Date().toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })
      .eq('id', downloadId);

    // Increment download count
    await supabaseService
      .from('plugins')
      .update({ 
        download_count: downloadData.plugins.download_count + 1 
      })
      .eq('id', downloadData.plugin_id);

    // Return file with appropriate headers
    const fileName = plugin.file_path.split('/').pop() || `${plugin.title.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
    
    return new Response(fileData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error("Download error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Download failed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      }
    );
  }
});