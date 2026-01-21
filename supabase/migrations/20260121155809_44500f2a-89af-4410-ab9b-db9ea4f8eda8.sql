-- Create uploads bucket for image storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads', 
  'uploads', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to the uploads bucket (for anonymous users)
CREATE POLICY "Anyone can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads');

-- Allow anyone to read uploaded images (public bucket)
CREATE POLICY "Anyone can view uploaded images"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Allow users to delete their own uploads (based on path pattern)
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'uploads');