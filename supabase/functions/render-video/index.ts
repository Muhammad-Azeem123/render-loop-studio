import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Placeholder {
  id: string;
  type: 'text' | 'image';
  value: string;
  startTime: number; // in seconds
  duration: number;  // in seconds
  position?: { x: number; y: number };
  style?: {
    fontSize?: number;
    color?: string;
    fontFamily?: string;
  };
}

interface RenderRequest {
  templateUrl: string;  // AWS S3 URL to template video
  placeholders: Placeholder[];
  outputFormat?: 'mp4' | 'webm';
  quality?: 'low' | 'medium' | 'high';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const renderRequest: RenderRequest = await req.json();
    
    console.log('[Render Video] Processing request:', {
      templateUrl: renderRequest.templateUrl,
      placeholderCount: renderRequest.placeholders.length,
      outputFormat: renderRequest.outputFormat || 'mp4',
    });

    // Step 1: Fetch template video from S3
    console.log('[Render Video] Fetching template from S3...');
    const templateResponse = await fetch(renderRequest.templateUrl);
    
    if (!templateResponse.ok) {
      throw new Error(`Failed to fetch template: ${templateResponse.statusText}`);
    }

    const templateBlob = await templateResponse.blob();
    console.log('[Render Video] Template fetched, size:', templateBlob.size);

    // Step 2: Video Processing Options
    // IMPORTANT: Edge Functions don't support FFmpeg natively
    // You need to integrate with a video processing API service
    
    // Option 1: Use Shotstack API (Recommended)
    const shotstackApiKey = Deno.env.get('SHOTSTACK_API_KEY');
    
    if (shotstackApiKey) {
      return await renderWithShotstack(
        renderRequest,
        shotstackApiKey,
        supabase
      );
    }

    // Option 2: Use Creatomate API
    const creatomateApiKey = Deno.env.get('CREATOMATE_API_KEY');
    
    if (creatomateApiKey) {
      return await renderWithCreatomate(
        renderRequest,
        creatomateApiKey,
        supabase
      );
    }

    // No video processing API configured
    return new Response(
      JSON.stringify({
        error: 'Video processing API not configured',
        message: 'Please configure SHOTSTACK_API_KEY or CREATOMATE_API_KEY secret',
        documentation: {
          shotstack: 'https://shotstack.io/docs',
          creatomate: 'https://creatomate.com/docs',
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[Render Video] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Render video using Shotstack API
 */
async function renderWithShotstack(
  renderRequest: RenderRequest,
  apiKey: string,
  supabase: any
) {
  console.log('[Shotstack] Starting render...');

  // Build Shotstack timeline
  const timeline = {
    soundtrack: {
      src: renderRequest.templateUrl,
    },
    tracks: [
      {
        clips: renderRequest.placeholders.map((placeholder) => {
          if (placeholder.type === 'text') {
            return {
              asset: {
                type: 'html',
                html: `<p style="font-size: ${placeholder.style?.fontSize || 24}px; color: ${placeholder.style?.color || '#ffffff'}">${placeholder.value}</p>`,
                css: 'p { font-family: Arial; }',
                width: 1920,
                height: 1080,
                position: 'center',
              },
              start: placeholder.startTime,
              length: placeholder.duration,
              position: placeholder.position?.x ? `${placeholder.position.x}% ${placeholder.position.y}%` : 'center',
            };
          } else if (placeholder.type === 'image') {
            return {
              asset: {
                type: 'image',
                src: placeholder.value,
              },
              start: placeholder.startTime,
              length: placeholder.duration,
              position: placeholder.position?.x ? `${placeholder.position.x}% ${placeholder.position.y}%` : 'center',
            };
          }
        }),
      },
    ],
  };

  const output = {
    format: renderRequest.outputFormat || 'mp4',
    resolution: renderRequest.quality === 'high' ? 'hd' : 'sd',
  };

  // Submit render job to Shotstack
  const renderResponse = await fetch('https://api.shotstack.io/v1/render', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeline,
      output,
    }),
  });

  if (!renderResponse.ok) {
    throw new Error(`Shotstack API error: ${await renderResponse.text()}`);
  }

  const renderData = await renderResponse.json();
  const renderId = renderData.response.id;

  console.log('[Shotstack] Render submitted, ID:', renderId);

  // Poll for render completion
  let renderComplete = false;
  let videoUrl = '';
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max

  while (!renderComplete && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

    const statusResponse = await fetch(
      `https://api.shotstack.io/v1/render/${renderId}`,
      {
        headers: { 'x-api-key': apiKey },
      }
    );

    const statusData = await statusResponse.json();
    const status = statusData.response.status;

    console.log('[Shotstack] Render status:', status);

    if (status === 'done') {
      renderComplete = true;
      videoUrl = statusData.response.url;
    } else if (status === 'failed') {
      throw new Error('Shotstack render failed');
    }

    attempts++;
  }

  if (!renderComplete) {
    throw new Error('Render timeout');
  }

  console.log('[Shotstack] Render complete:', videoUrl);

  // Upload to Supabase Storage
  const fileName = `${renderId}.${renderRequest.outputFormat || 'mp4'}`;
  const videoResponse = await fetch(videoUrl);
  const videoBlob = await videoResponse.blob();
  const videoBuffer = await videoBlob.arrayBuffer();

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('rendered-videos')
    .upload(fileName, videoBuffer, {
      contentType: `video/${renderRequest.outputFormat || 'mp4'}`,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: publicUrl } = supabase.storage
    .from('rendered-videos')
    .getPublicUrl(fileName);

  return new Response(
    JSON.stringify({
      success: true,
      videoUrl: publicUrl.publicUrl,
      renderId,
      fileName,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Render video using Creatomate API
 */
async function renderWithCreatomate(
  renderRequest: RenderRequest,
  apiKey: string,
  supabase: any
) {
  console.log('[Creatomate] Starting render...');

  // Build Creatomate render data
  const modifications = renderRequest.placeholders.reduce((acc, placeholder) => {
    acc[placeholder.id] = placeholder.value;
    return acc;
  }, {} as Record<string, string>);

  const renderResponse = await fetch('https://api.creatomate.com/v1/renders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id: 'your-template-id', // User needs to create template in Creatomate
      modifications,
      output_format: renderRequest.outputFormat || 'mp4',
    }),
  });

  if (!renderResponse.ok) {
    throw new Error(`Creatomate API error: ${await renderResponse.text()}`);
  }

  const renderData = await renderResponse.json();
  const videoUrl = renderData[0].url;

  console.log('[Creatomate] Render complete:', videoUrl);

  // Upload to Supabase Storage
  const fileName = `${crypto.randomUUID()}.${renderRequest.outputFormat || 'mp4'}`;
  const videoResponse = await fetch(videoUrl);
  const videoBlob = await videoResponse.blob();
  const videoBuffer = await videoBlob.arrayBuffer();

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('rendered-videos')
    .upload(fileName, videoBuffer, {
      contentType: `video/${renderRequest.outputFormat || 'mp4'}`,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: publicUrl } = supabase.storage
    .from('rendered-videos')
    .getPublicUrl(fileName);

  return new Response(
    JSON.stringify({
      success: true,
      videoUrl: publicUrl.publicUrl,
      fileName,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
