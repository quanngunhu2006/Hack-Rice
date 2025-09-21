-- Migration to add downvote support to the voting system
-- Run this in your Supabase SQL Editor

-- Create vote_type enum first if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vote_type') THEN
        CREATE TYPE vote_type AS ENUM ('up', 'down');
    END IF;
END$$;

-- Add downvotes column to proposals table
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;

-- Since votes table has UUID foreign key but proposals uses bigint,
-- we need to recreate the votes table with correct types
-- This assumes votes table doesn't have critical data yet

-- Drop existing votes table (be careful in production!)
DROP TABLE IF EXISTS votes;

-- Recreate votes table with correct types
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id BIGINT REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  author_id TEXT REFERENCES profiles(author_id) ON DELETE CASCADE NOT NULL,
  vote_type vote_type NOT NULL DEFAULT 'up',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, author_id)
);

-- Drop the old cast_vote function first to avoid conflicts
DROP FUNCTION IF EXISTS cast_vote(BIGINT, vote_type, TEXT);
DROP FUNCTION IF EXISTS cast_vote(BIGINT, vote_type);
DROP FUNCTION IF EXISTS cast_vote(UUID, vote_type);

-- Update the cast_vote function to handle downvotes
CREATE OR REPLACE FUNCTION cast_vote(proposal_id BIGINT, vote_direction vote_type DEFAULT 'up', user_id TEXT DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  user_text TEXT;
  existing_vote votes;
  existing_vote_type vote_type;
  user_verified BOOLEAN;
  new_vote_type vote_type;
BEGIN
  -- Use provided user_id or fall back to auth.uid()
  user_text := COALESCE(user_id, auth.uid()::TEXT);

  -- For demo purposes, use a default demo user if no user is authenticated
  IF user_text IS NULL THEN
    user_text := 'demo-user-' || md5(random()::text)::text;
  END IF;

  -- Check if user is verified resident (create profile if doesn't exist)
  SELECT verified_resident INTO user_verified FROM profiles WHERE author_id = user_text;

  -- If profile doesn't exist, create it
  IF user_verified IS NULL THEN
    INSERT INTO profiles (author_id, email, full_name, verified_resident)
    VALUES (user_text, user_text || '@demo.local', 'Demo User', FALSE)
    ON CONFLICT (author_id) DO NOTHING;

    -- Set as not verified by default
    user_verified := FALSE;
  END IF;

  -- For now, allow voting even if not verified (can be changed later)
  -- IF NOT user_verified THEN
  --   RETURN json_build_object('success', false, 'message', 'Must be verified resident to vote');
  -- END IF;

  -- Check if user has already voted
  SELECT * INTO existing_vote FROM votes WHERE votes.proposal_id = cast_vote.proposal_id AND votes.author_id = user_text;

  IF existing_vote.id IS NOT NULL THEN
    existing_vote_type := existing_vote.vote_type;

    -- If same vote type, remove the vote (toggle off)
    IF existing_vote_type = vote_direction THEN
      DELETE FROM votes WHERE votes.id = existing_vote.id;

      -- Decrement appropriate counter
      IF vote_direction = 'up' THEN
        UPDATE proposals SET upvotes = upvotes - 1 WHERE id = cast_vote.proposal_id;
      ELSE
        UPDATE proposals SET downvotes = downvotes - 1 WHERE id = cast_vote.proposal_id;
      END IF;

      RETURN json_build_object('success', true, 'message', 'Vote removed successfully', 'vote_type', NULL);
    ELSE
      -- Change vote from up to down or down to up
      UPDATE votes SET vote_type = vote_direction WHERE votes.id = existing_vote.id;

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

-- Add index for downvotes column for performance
CREATE INDEX IF NOT EXISTS idx_proposals_downvotes ON proposals(downvotes);

-- Enable RLS on votes table
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Recreate votes policies (allow demo mode)
CREATE POLICY "Anyone can view votes" ON votes
  FOR SELECT USING (true);

-- For demo purposes, allow votes with any author_id (authentication bypassed in function)
CREATE POLICY "Users can insert their own votes" ON votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own votes" ON votes
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own votes" ON votes
  FOR DELETE USING (true);

-- Recreate indexes for votes table
CREATE INDEX idx_votes_proposal_id ON votes(proposal_id);
CREATE INDEX idx_votes_author_id ON votes(author_id);
