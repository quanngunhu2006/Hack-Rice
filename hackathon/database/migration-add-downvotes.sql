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
      DELETE FROM votes WHERE votes.id = existing_vote.id;

      -- Decrement appropriate counter
      IF vote_direction = 'up' THEN
        UPDATE proposals SET upvotes = proposals.upvotes - 1 WHERE proposals.id = cast_vote.proposal_id;
      ELSE
        UPDATE proposals SET downvotes = proposals.downvotes - 1 WHERE proposals.id = cast_vote.proposal_id;
      END IF;

      RETURN json_build_object('success', true, 'message', 'Vote removed successfully', 'vote_type', NULL);
    ELSE
      -- Change vote from up to down or down to up
      UPDATE votes SET vote_type = vote_direction WHERE votes.id = existing_vote.id;

      -- Update counters: remove old vote, add new vote
      IF existing_vote_type = 'up' THEN
        UPDATE proposals SET upvotes = proposals.upvotes - 1, downvotes = proposals.downvotes + 1 WHERE proposals.id = cast_vote.proposal_id;
      ELSE
        UPDATE proposals SET upvotes = proposals.upvotes + 1, downvotes = proposals.downvotes - 1 WHERE proposals.id = cast_vote.proposal_id;
      END IF;

      RETURN json_build_object('success', true, 'message', 'Vote changed successfully', 'vote_type', vote_direction);
    END IF;
  ELSE
    -- Insert new vote
    INSERT INTO votes (proposal_id, author_id, vote_type) VALUES (cast_vote.proposal_id, user_text, vote_direction);

    -- Increment appropriate counter
    IF vote_direction = 'up' THEN
      UPDATE proposals SET upvotes = proposals.upvotes + 1 WHERE proposals.id = cast_vote.proposal_id;
    ELSE
      UPDATE proposals SET downvotes = proposals.downvotes + 1 WHERE proposals.id = cast_vote.proposal_id;
    END IF;

    RETURN json_build_object('success', true, 'message', 'Vote cast successfully', 'vote_type', vote_direction);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for downvotes column for performance
CREATE INDEX IF NOT EXISTS idx_proposals_downvotes ON proposals(downvotes);

-- Enable RLS on votes table
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Recreate votes policies
CREATE POLICY "Anyone can view votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes" ON votes
  FOR INSERT WITH CHECK (auth.uid()::text = author_id);

-- Recreate indexes for votes table
CREATE INDEX idx_votes_proposal_id ON votes(proposal_id);
CREATE INDEX idx_votes_author_id ON votes(author_id);
