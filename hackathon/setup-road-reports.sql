-- Setup script for road_reports table
-- Run this in your Supabase SQL editor

-- First, check if the table exists
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'road_reports';

-- Create the road_reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS road_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id TEXT REFERENCES profiles(author_id) ON DELETE CASCADE NOT NULL,
  geom GEOMETRY(POINT, 4326) NOT NULL,
  street_name TEXT,
  description TEXT NOT NULL,
  media_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_road_reports_geom ON road_reports USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_road_reports_author_id ON road_reports(author_id);
CREATE INDEX IF NOT EXISTS idx_road_reports_created_at ON road_reports(created_at);

-- Enable RLS
ALTER TABLE road_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Test the setup
SELECT 'Setup complete! Table created successfully.' as status;
