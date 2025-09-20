-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enums
CREATE TYPE proposal_category AS ENUM ('Roads', 'Sanitation', 'Parks', 'Safety', 'Zoning', 'Other');
CREATE TYPE proposal_status AS ENUM ('draft', 'published', 'petitioning', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  address TEXT,
  zip TEXT,
  verified_resident BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create proposals table
CREATE TABLE proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL CHECK (LENGTH(summary) <= 280),
  body_md TEXT,
  category proposal_category NOT NULL,
  scope_verified BOOLEAN DEFAULT FALSE,
  status proposal_status DEFAULT 'draft',
  upvotes INTEGER DEFAULT 0,
  location_hint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create votes table (one vote per user per proposal)
CREATE TABLE votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);

-- Create road_reports table
CREATE TABLE road_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  geom GEOMETRY(POINT, 4326) NOT NULL,
  street_name TEXT,
  description TEXT NOT NULL,
  media_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RPC function to cast vote (atomic operation)
CREATE OR REPLACE FUNCTION cast_vote(proposal_id UUID)
RETURNS JSON AS $$
DECLARE
  user_uuid UUID;
  existing_vote UUID;
  user_verified BOOLEAN;
BEGIN
  -- Get current user
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not authenticated');
  END IF;
  
  -- Check if user is verified resident
  SELECT verified_resident INTO user_verified FROM profiles WHERE id = user_uuid;
  
  IF NOT user_verified THEN
    RETURN json_build_object('success', false, 'message', 'Must be verified resident to vote');
  END IF;
  
  -- Check if user has already voted
  SELECT id INTO existing_vote FROM votes WHERE votes.proposal_id = cast_vote.proposal_id AND user_id = user_uuid;
  
  IF existing_vote IS NOT NULL THEN
    RETURN json_build_object('success', false, 'message', 'Already voted on this proposal');
  END IF;
  
  -- Insert vote and increment counter
  INSERT INTO votes (proposal_id, user_id) VALUES (cast_vote.proposal_id, user_uuid);
  UPDATE proposals SET upvotes = upvotes + 1 WHERE id = cast_vote.proposal_id;
  
  RETURN json_build_object('success', true, 'message', 'Vote cast successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get road reports in bounding box
CREATE OR REPLACE FUNCTION get_road_reports_in_bbox(
  min_lng FLOAT,
  min_lat FLOAT,
  max_lng FLOAT,
  max_lat FLOAT
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  street_name TEXT,
  description TEXT,
  media_urls TEXT[],
  created_at TIMESTAMPTZ,
  lng FLOAT,
  lat FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.street_name,
    r.description,
    r.media_urls,
    r.created_at,
    ST_X(r.geom) as lng,
    ST_Y(r.geom) as lat
  FROM road_reports r
  WHERE ST_Within(
    r.geom, 
    ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
  );
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE road_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for proposals
CREATE POLICY "Anyone can view published proposals" ON proposals FOR SELECT USING (status = 'published' OR status = 'petitioning');
CREATE POLICY "Verified residents can create proposals" ON proposals FOR INSERT WITH CHECK (
  auth.uid() = author_id AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND verified_resident = true)
);
CREATE POLICY "Authors can update own proposals" ON proposals FOR UPDATE USING (auth.uid() = author_id);

-- RLS Policies for votes
CREATE POLICY "Anyone can view votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Verified residents can vote" ON votes FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND verified_resident = true)
);

-- RLS Policies for road_reports
CREATE POLICY "Anyone can view road reports" ON road_reports FOR SELECT USING (true);
CREATE POLICY "Verified residents can create reports" ON road_reports FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND verified_resident = true)
);
CREATE POLICY "Users can update own reports" ON road_reports FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_category ON proposals(category);
CREATE INDEX idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX idx_proposals_upvotes ON proposals(upvotes DESC);
CREATE INDEX idx_proposals_author ON proposals(author_id);

CREATE INDEX idx_votes_proposal ON votes(proposal_id);
CREATE INDEX idx_votes_user ON votes(user_id);

CREATE INDEX idx_road_reports_geom ON road_reports USING GIST(geom);
CREATE INDEX idx_road_reports_created_at ON road_reports(created_at DESC);

-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Storage policies
CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'media' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own media" ON storage.objects FOR UPDATE USING (
  bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own media" ON storage.objects FOR DELETE USING (
  bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]
);
