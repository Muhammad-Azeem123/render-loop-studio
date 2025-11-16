-- Create storage bucket for rendered videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('rendered-videos', 'rendered-videos', true);

-- Allow public read access to rendered videos
CREATE POLICY "Public Access to Rendered Videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'rendered-videos');

-- Allow service role to upload rendered videos
CREATE POLICY "Service Role Upload Rendered Videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'rendered-videos');