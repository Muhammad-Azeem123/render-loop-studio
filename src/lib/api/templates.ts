import { supabase } from '@/integrations/supabase/client';

const TEMPLATES_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/templates`;

interface TemplateData {
  backgroundImage?: string;
  backgroundVideo?: string;
  placeholders: any[];
  iterations: any[];
}

export const templatesApi = {
  /**
   * Fetch a template by ID
   */
  async getTemplate(id: string) {
    const response = await fetch(`${TEMPLATES_API_URL}?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch template');
    }

    return response.json();
  },

  /**
   * Create/Share a new template
   */
  async createTemplate(templateData: TemplateData) {
    const response = await fetch(TEMPLATES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ template_data: templateData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create template');
    }

    return response.json();
  },

  /**
   * Update an existing template
   */
  async updateTemplate(id: string, templateData: TemplateData) {
    const response = await fetch(`${TEMPLATES_API_URL}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ template_data: templateData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update template');
    }

    return response.json();
  },

  /**
   * Delete a template
   */
  async deleteTemplate(id: string) {
    const response = await fetch(`${TEMPLATES_API_URL}?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete template');
    }

    return response.json();
  },
};
