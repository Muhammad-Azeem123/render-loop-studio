import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TemplateData {
  backgroundImage?: string;
  backgroundVideo?: string;
  placeholders: any[];
  iterations: any[];
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

    const url = new URL(req.url);
    const method = req.method;
    const id = url.searchParams.get('id');

    console.log(`[Templates API] ${method} request`, { id });

    // GET - Fetch template by ID
    if (method === 'GET' && id) {
      const { data, error } = await supabase
        .from('shared_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('[Templates API] Fetch error:', error);
        return new Response(
          JSON.stringify({ error: 'Template not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[Templates API] Template fetched successfully');
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Create/Share template
    if (method === 'POST') {
      const body = await req.json();
      const templateData: TemplateData = body.template_data;

      console.log('[Templates API] Creating template with data:', {
        hasBackground: !!templateData.backgroundImage || !!templateData.backgroundVideo,
        placeholderCount: templateData.placeholders?.length || 0,
        iterationCount: templateData.iterations?.length || 0,
      });

      const { data, error } = await supabase
        .from('shared_templates')
        .insert({ template_data: templateData })
        .select()
        .single();

      if (error) {
        console.error('[Templates API] Create error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create template' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[Templates API] Template created successfully:', data.id);
      return new Response(
        JSON.stringify(data),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT - Update template
    if (method === 'PUT' && id) {
      const body = await req.json();
      const templateData: TemplateData = body.template_data;

      console.log('[Templates API] Updating template:', id);

      const { data, error } = await supabase
        .from('shared_templates')
        .update({ template_data: templateData })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[Templates API] Update error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update template' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[Templates API] Template updated successfully');
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE - Delete template
    if (method === 'DELETE' && id) {
      console.log('[Templates API] Deleting template:', id);

      const { error } = await supabase
        .from('shared_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[Templates API] Delete error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete template' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[Templates API] Template deleted successfully');
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Templates API] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
