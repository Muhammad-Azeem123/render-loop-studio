-- Create a table for shared templates
CREATE TABLE public.shared_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shared_templates ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read shared templates (public access)
CREATE POLICY "Anyone can view shared templates"
ON public.shared_templates
FOR SELECT
USING (true);

-- Allow anyone to create shared templates (public access)
CREATE POLICY "Anyone can create shared templates"
ON public.shared_templates
FOR INSERT
WITH CHECK (true);