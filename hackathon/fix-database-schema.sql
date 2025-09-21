-- Fix for the UUID error
-- Run this SQL in your Supabase SQL editor

-- First, let's check the current structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'road_reports';

-- Option 1: Rename the column to match your types
ALTER TABLE road_reports RENAME COLUMN author_id TO user_id;

-- Option 2: If you prefer to keep author_id, update the types instead
-- (Comment out Option 1 and use this instead)
-- ALTER TABLE road_reports RENAME COLUMN user_id TO author_id;

-- Update the foreign key constraint
ALTER TABLE road_reports DROP CONSTRAINT IF EXISTS road_reports_author_id_fkey;
ALTER TABLE road_reports ADD CONSTRAINT road_reports_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(author_id) ON DELETE CASCADE;

-- Update the RLS policies
DROP POLICY IF EXISTS "Users can create road reports" ON road_reports;
DROP POLICY IF EXISTS "Users can update their own road reports" ON road_reports;
DROP POLICY IF EXISTS "Users can delete their own road reports" ON road_reports;

CREATE POLICY "Users can create road reports" ON road_reports
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own road reports" ON road_reports
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own road reports" ON road_reports
  FOR DELETE USING (auth.uid()::text = user_id);

-- Update the function to use user_id
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
