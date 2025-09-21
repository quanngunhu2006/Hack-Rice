-- Update database schema to match your current structure
-- Your table already has the correct structure, just need to ensure proper setup

-- Your current table structure is correct:
-- id: int4 (auto-incrementing primary key)
-- author_id: text (Auth0 user ID)
-- geom: geometry (PostGIS point)
-- street_name: text
-- description: text
-- media_urls: text[]

-- Just ensure the table has proper constraints and indexes
ALTER TABLE road_reports 
ADD CONSTRAINT IF NOT EXISTS road_reports_pkey PRIMARY KEY (id);

-- Add foreign key constraint if not exists
ALTER TABLE road_reports 
ADD CONSTRAINT IF NOT EXISTS road_reports_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES profiles(author_id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_road_reports_geom ON road_reports USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_road_reports_author_id ON road_reports(author_id);
CREATE INDEX IF NOT EXISTS idx_road_reports_created_at ON road_reports(created_at);

-- Ensure RLS is enabled
ALTER TABLE road_reports ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can view road reports" ON road_reports;
DROP POLICY IF EXISTS "Users can create road reports" ON road_reports;
DROP POLICY IF EXISTS "Users can update their own road reports" ON road_reports;
DROP POLICY IF EXISTS "Users can delete their own road reports" ON road_reports;

CREATE POLICY "Anyone can view road reports" ON road_reports
  FOR SELECT USING (true);

CREATE POLICY "Users can create road reports" ON road_reports
  FOR INSERT WITH CHECK (auth.uid()::text = author_id);

CREATE POLICY "Users can update their own road reports" ON road_reports
  FOR UPDATE USING (auth.uid()::text = author_id);

CREATE POLICY "Users can delete their own road reports" ON road_reports
  FOR DELETE USING (auth.uid()::text = author_id);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('road-reports', 'road-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Anyone can view road report images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload road report images" ON storage.objects;

CREATE POLICY "Anyone can view road report images" ON storage.objects
FOR SELECT USING (bucket_id = 'road-reports');

CREATE POLICY "Authenticated users can upload road report images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'road-reports' 
  AND auth.role() = 'authenticated'
);

-- Test query to verify structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'road_reports' 
ORDER BY ordinal_position;
