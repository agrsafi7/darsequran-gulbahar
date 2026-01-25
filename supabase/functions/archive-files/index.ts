const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArchiveFile {
  name: string;
  source: string;
  format: string;
  length?: string;
  title?: string;
  size?: string;
  track?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itemId, format = 'VBR MP3' } = await req.json();

    if (!itemId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Item ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching Archive.org files for:', itemId);

    // Fetch files metadata from Archive.org
    const response = await fetch(`https://archive.org/metadata/${itemId}/files`);
    
    if (!response.ok) {
      console.error('Archive.org API error:', response.status);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch from Archive.org: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    // Filter files by format (default: VBR MP3)
    const files: ArchiveFile[] = data.result
      .filter((file: ArchiveFile) => file.format === format)
      .map((file: ArchiveFile) => ({
        name: file.name,
        title: file.title || file.name.replace(/\.[^/.]+$/, '').replace(/-/g, ' '),
        size: file.size,
        length: file.length,
        track: file.track,
        downloadUrl: `https://archive.org/download/${itemId}/${encodeURIComponent(file.name)}`,
      }))
      .sort((a: { track?: string }, b: { track?: string }) => {
        // Sort by track number if available
        const trackA = parseInt(a.track || '0', 10);
        const trackB = parseInt(b.track || '0', 10);
        return trackA - trackB;
      });

    console.log(`Found ${files.length} ${format} files`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        itemId,
        files,
        totalFiles: files.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching archive files:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch files';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
