-- Road Reports Database Schema Updates
-- Run these SQL commands in your Supabase SQL editor

-- Update the road_reports table to match your types (if needed)
-- First, check if you need to rename author_id to user_id
-- ALTER TABLE road_reports RENAME COLUMN author_id TO user_id;

-- Add spatial index for better performance
CREATE INDEX IF NOT EXISTS idx_road_reports_geom ON road_reports USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_road_reports_user_id ON road_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_road_reports_created_at ON road_reports(created_at);

-- Function to get road reports in bounding box
CREATE OR REPLACE FUNCTION get_road_reports_in_bbox(
  min_lng DOUBLE PRECISION,
  min_lat DOUBLE PRECISION,
  max_lng DOUBLE PRECISION,
  max_lat DOUBLE PRECISION
)
RETURNS TABLE (
  id UUID,
  user_id TEXT,
  street_name TEXT,
  description TEXT,
  media_urls TEXT[],
  created_at TIMESTAMPTZ,
  lng DOUBLE PRECISION,
  lat DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rr.id,
    rr.user_id,
    rr.street_name,
    rr.description,
    rr.media_urls,
    rr.created_at,
    ST_X(rr.geom) as lng,
    ST_Y(rr.geom) as lat
  FROM road_reports rr
  WHERE rr.geom && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for road_reports
DROP POLICY IF EXISTS "Users can create road reports" ON road_reports;
DROP POLICY IF EXISTS "Users can update their own road reports" ON road_reports;
DROP POLICY IF EXISTS "Users can delete their own road reports" ON road_reports;

CREATE POLICY "Users can create road reports" ON road_reports
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own road reports" ON road_reports
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own road reports" ON road_reports
  FOR DELETE USING (auth.uid()::text = user_id);

-- Storage bucket for road report images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('road-reports', 'road-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Anyone can view road report images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload road report images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own road report images" ON storage.objects;

CREATE POLICY "Anyone can view road report images" ON storage.objects
FOR SELECT USING (bucket_id = 'road-reports');

CREATE POLICY "Authenticated users can upload road report images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'road-reports' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own road report images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'road-reports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
