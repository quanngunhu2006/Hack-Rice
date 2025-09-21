-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enums (optional if you want to use ENUM)
CREATE TYPE proposal_category AS ENUM ('Roads', 'Sanitation', 'Parks', 'Safety', 'Zoning', 'Other');
CREATE TYPE proposal_status AS ENUM ('draft', 'published', 'petitioning', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE profiles (
  author_id TEXT NOT NULL DEFAULT (auth.uid())::text PRIMARY KEY,
  given_name TEXT,
  family_name TEXT,
  nickname TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT,
  email TEXT NOT NULL UNIQUE,
  picture TEXT,
  connection TEXT,
  address TEXT,
  zip TEXT,
  verified_resident BOOLEAN DEFAULT FALSE
);

-- Create proposals table
/*CREATE TABLE proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES profiles(author_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL CHECK (LENGTH(summary) <= 280),
  body_md TEXT,
  category TEXT NOT NULL, -- or proposal_category if using ENUM
  
  
  location_hint TEXT,
  
);*/
CREATE TABLE public.proposals (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  author_id text DEFAULT ''::text,
  title text DEFAULT ''::text,
  summary text DEFAULT ''::text,
  body_md text DEFAULT ''::text,
  category USER-DEFINED,
  scope_verified boolean,
  status USER-DEFINED,
  upvotes integer,
  location_hint text DEFAULT ''::text,
  updated_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
  CONSTRAINT proposals2_pkey PRIMARY KEY (id),
  CONSTRAINT proposals2_uid_fkey FOREIGN KEY (uid) REFERENCES auth.users(id),
  CONSTRAINT proposals2_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(author_id)
);






-- Create votes table (one vote per user per proposal)
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  author_id TEXT REFERENCES profiles(author_id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, author_id)
);

-- Create road_reports table
CREATE TABLE road_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id TEXT REFERENCES profiles(author_id) ON DELETE CASCADE NOT NULL,
  geom GEOMETRY(POINT, 4326) NOT NULL,
  street_name TEXT,
  description TEXT NOT NULL,
  media_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger function and triggers remain the same
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC function to cast vote (updated author_id references)
CREATE OR REPLACE FUNCTION cast_vote(proposal_id UUID)
RETURNS JSON AS $$
DECLARE
  user_text TEXT;
  existing_vote UUID;
  user_verified BOOLEAN;
BEGIN
  -- Get current user
  user_text := auth.uid();

  IF user_text IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not authenticated');
  END IF;

  -- Check if user is verified resident
  SELECT verified_resident INTO user_verified FROM profiles WHERE author_id = user_text;

  IF NOT user_verified THEN
    RETURN json_build_object('success', false, 'message', 'Must be verified resident to vote');
  END IF;

  -- Check if user has already voted
  SELECT id INTO existing_vote FROM votes WHERE proposal_id = cast_vote.proposal_id AND author_id = user_text;

  IF existing_vote IS NOT NULL THEN
    RETURN json_build_object('success', false, 'message', 'Already voted on this proposal');
  END IF;

  -- Insert vote and increment counter
  INSERT INTO votes (proposal_id, author_id) VALUES (cast_vote.proposal_id, user_text);
  UPDATE proposals SET upvotes = upvotes + 1 WHERE id = cast_vote.proposal_id;

  RETURN json_build_object('success', true, 'message', 'Vote cast successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Road reports function remains unchanged except for author_id rename if needed

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE road_reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = author_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = author_id);

-- Proposals policies
CREATE POLICY "Anyone can view published proposals" ON proposals
  FOR SELECT USING (status IN ('published', 'petitioning'));

CREATE POLICY "Users can view their own draft proposals" ON proposals
  FOR SELECT USING (auth.uid()::text = author_id);

CREATE POLICY "Users can create proposals" ON proposals
  FOR INSERT WITH CHECK (auth.uid()::text = author_id);

CREATE POLICY "Users can update their own proposals" ON proposals
  FOR UPDATE USING (auth.uid()::text = author_id);

-- Votes policies
CREATE POLICY "Anyone can view votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes" ON votes
  FOR INSERT WITH CHECK (auth.uid()::text = author_id);

-- Road reports policies
CREATE POLICY "Anyone can view road reports" ON road_reports
  FOR SELECT USING (true);

CREATE POLICY "Users can create road reports" ON road_reports
  FOR INSERT WITH CHECK (auth.uid()::text = author_id);

CREATE POLICY "Users can update their own road reports" ON road_reports
  FOR UPDATE USING (auth.uid()::text = author_id);

-- Indexes for performance
CREATE INDEX idx_proposals_author_id ON proposals(author_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_category ON proposals(category);
CREATE INDEX idx_votes_proposal_id ON votes(proposal_id);
CREATE INDEX idx_votes_author_id ON votes(author_id);
CREATE INDEX idx_road_reports_author_id ON road_reports(author_id);

-- Storage buckets (if needed for file uploads)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, 'road-reports', true);

