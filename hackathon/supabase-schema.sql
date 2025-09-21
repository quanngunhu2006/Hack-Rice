-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enums (optional if you want to use ENUM)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proposal_category') THEN
        CREATE TYPE proposal_category AS ENUM ('Roads', 'Sanitation', 'Parks', 'Safety', 'Zoning', 'Other');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proposal_status') THEN
        CREATE TYPE proposal_status AS ENUM ('draft', 'published', 'petitioning', 'approved', 'rejected');
    END IF;
END$$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  author_id TEXT NOT NULL PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS public.proposals (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  author_id text DEFAULT ''::text,
  title text DEFAULT ''::text,
  summary text DEFAULT ''::text,
  body_md text DEFAULT ''::text,
  category proposal_category,
  scope_verified boolean,
  status proposal_status,
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  location_hint text DEFAULT ''::text,
  updated_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
  CONSTRAINT proposals2_pkey PRIMARY KEY (id),
  CONSTRAINT proposals2_uid_fkey FOREIGN KEY (uid) REFERENCES auth.users(id),
  CONSTRAINT proposals2_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(author_id)
);






-- Create vote type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vote_type') THEN
        CREATE TYPE vote_type AS ENUM ('up', 'down');
    END IF;
END$$;

-- Create votes table (one vote per user per proposal)
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id BIGINT REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  author_id TEXT REFERENCES profiles(author_id) ON DELETE CASCADE NOT NULL,
  vote_type vote_type NOT NULL DEFAULT 'up',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, author_id)
);

-- Create road_reports table
CREATE TABLE IF NOT EXISTS road_reports (
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

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_proposals_updated_at') THEN
        CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- RPC function to cast or toggle vote
DROP FUNCTION IF EXISTS cast_vote(BIGINT, vote_type, TEXT);
DROP FUNCTION IF EXISTS cast_vote(BIGINT, vote_type);
DROP FUNCTION IF EXISTS cast_vote(UUID, vote_type);
CREATE OR REPLACE FUNCTION cast_vote(proposal_id BIGINT, vote_direction vote_type DEFAULT 'up', user_id TEXT DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  user_text TEXT;
  existing_vote votes;
  existing_vote_type vote_type;
  user_verified BOOLEAN;
BEGIN
  -- Use provided user_id (from Auth0) - auth.uid() might not work with Auth0
  user_text := COALESCE(user_id, '');

  IF user_text IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not authenticated');
  END IF;

  -- Check if user is verified resident
  SELECT verified_resident INTO user_verified FROM profiles WHERE author_id = user_text;

  IF NOT user_verified THEN
    RETURN json_build_object('success', false, 'message', 'Must be verified resident to vote');
  END IF;

  -- Check if user has already voted
  SELECT * INTO existing_vote FROM votes WHERE votes.proposal_id = cast_vote.proposal_id AND votes.author_id = user_text;

  IF existing_vote.id IS NOT NULL THEN
    existing_vote_type := existing_vote.vote_type;

    -- If same vote type, remove the vote (toggle off)
    IF existing_vote_type = vote_direction THEN
      DELETE FROM votes WHERE id = existing_vote.id;

      -- Decrement appropriate counter
      IF vote_direction = 'up' THEN
        UPDATE proposals SET upvotes = upvotes - 1 WHERE id = cast_vote.proposal_id;
      ELSE
        UPDATE proposals SET downvotes = downvotes - 1 WHERE id = cast_vote.proposal_id;
      END IF;

      RETURN json_build_object('success', true, 'message', 'Vote removed successfully', 'vote_type', NULL);
    ELSE
      -- Change vote from up to down or down to up
      UPDATE votes SET vote_type = vote_direction WHERE id = existing_vote.id;

      -- Update counters: remove old vote, add new vote
      IF existing_vote_type = 'up' THEN
        UPDATE proposals SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = cast_vote.proposal_id;
      ELSE
        UPDATE proposals SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = cast_vote.proposal_id;
      END IF;

      RETURN json_build_object('success', true, 'message', 'Vote changed successfully', 'vote_type', vote_direction);
    END IF;
  ELSE
    -- Insert new vote
    INSERT INTO votes (proposal_id, author_id, vote_type) VALUES (cast_vote.proposal_id, user_text, vote_direction);

    -- Increment appropriate counter
    IF vote_direction = 'up' THEN
      UPDATE proposals SET upvotes = upvotes + 1 WHERE id = cast_vote.proposal_id;
    ELSE
      UPDATE proposals SET downvotes = downvotes + 1 WHERE id = cast_vote.proposal_id;
    END IF;

    RETURN json_build_object('success', true, 'message', 'Vote cast successfully', 'vote_type', vote_direction);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Road reports function remains unchanged except for author_id rename if needed

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE road_reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
    CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
    CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (true);
END$$;

-- Proposals policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anyone can view published proposals" ON proposals;
    CREATE POLICY "Anyone can view published proposals" ON proposals FOR SELECT USING (status IN ('published', 'petitioning'));

    DROP POLICY IF EXISTS "Users can view their own draft proposals" ON proposals;
    CREATE POLICY "Users can view their own draft proposals" ON proposals FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Users can create proposals" ON proposals;
    CREATE POLICY "Users can create proposals" ON proposals FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Users can update their own proposals" ON proposals;
    CREATE POLICY "Users can update their own proposals" ON proposals FOR UPDATE USING (true);
END$$;

-- Votes policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anyone can view votes" ON votes;
    CREATE POLICY "Anyone can view votes" ON votes FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Users can insert their own votes" ON votes;
    CREATE POLICY "Users can insert their own votes" ON votes FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Users can update their own votes" ON votes;
    CREATE POLICY "Users can update their own votes" ON votes FOR UPDATE USING (true);

    DROP POLICY IF EXISTS "Users can delete their own votes" ON votes;
    CREATE POLICY "Users can delete their own votes" ON votes FOR DELETE USING (true);
END$$;

-- Road reports policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anyone can view road reports" ON road_reports;
    CREATE POLICY "Anyone can view road reports" ON road_reports FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Users can create road reports" ON road_reports;
    CREATE POLICY "Users can create road reports" ON road_reports FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Users can update their own road reports" ON road_reports;
    CREATE POLICY "Users can update their own road reports" ON road_reports FOR UPDATE USING (true);
END$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_proposals_author_id ON proposals(author_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_category ON proposals(category);
CREATE INDEX IF NOT EXISTS idx_proposals_downvotes ON proposals(downvotes);
CREATE INDEX IF NOT EXISTS idx_votes_proposal_id ON votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_votes_author_id ON votes(author_id);
CREATE INDEX IF NOT EXISTS idx_road_reports_author_id ON road_reports(author_id);

-- Storage buckets (if needed for file uploads)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, 'road-reports', true);

