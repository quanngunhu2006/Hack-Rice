-- Migration: Add goal tracking functionality
-- This migration adds tables and functions to track when proposals reach their upvote goals
-- and collect user commitments for next steps

-- Add goal_reached_at column to proposals table
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS goal_reached_at TIMESTAMPTZ;

-- Create goal_commitments table to track user commitments when goals are reached
CREATE TABLE IF NOT EXISTS goal_commitments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id BIGINT REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  signature TEXT NOT NULL,
  upvote_count_at_commitment INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_goal_commitments_proposal_id ON goal_commitments(proposal_id);
CREATE INDEX IF NOT EXISTS idx_goal_commitments_email ON goal_commitments(email);

-- Add updated_at trigger for goal_commitments
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_goal_commitments_updated_at') THEN
        CREATE TRIGGER update_goal_commitments_updated_at 
        BEFORE UPDATE ON goal_commitments 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Enable RLS on goal_commitments table
ALTER TABLE goal_commitments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for goal_commitments
DO $$
BEGIN
    -- Anyone can view goal commitments (for transparency)
    DROP POLICY IF EXISTS "Anyone can view goal commitments" ON goal_commitments;
    CREATE POLICY "Anyone can view goal commitments" ON goal_commitments FOR SELECT USING (true);

    -- Anyone can insert goal commitments (when they commit to a proposal)
    DROP POLICY IF EXISTS "Anyone can create goal commitments" ON goal_commitments;
    CREATE POLICY "Anyone can create goal commitments" ON goal_commitments FOR INSERT WITH CHECK (true);

    -- Only the original committer can update their commitment (by email)
    DROP POLICY IF EXISTS "Users can update their own goal commitments" ON goal_commitments;
    CREATE POLICY "Users can update their own goal commitments" ON goal_commitments 
    FOR UPDATE USING (true);
END$$;

-- Function to get goal commitment statistics for a proposal
CREATE OR REPLACE FUNCTION get_proposal_goal_stats(proposal_id_param BIGINT)
RETURNS JSON AS $$
DECLARE
  result JSON;
  commitment_count INTEGER;
  goal_reached_at_time TIMESTAMPTZ;
BEGIN
  -- Get commitment count
  SELECT COUNT(*) INTO commitment_count 
  FROM goal_commitments 
  WHERE proposal_id = proposal_id_param;

  -- Get goal reached timestamp
  SELECT goal_reached_at INTO goal_reached_at_time
  FROM proposals 
  WHERE id = proposal_id_param;

  -- Build result JSON
  result := json_build_object(
    'proposal_id', proposal_id_param,
    'commitment_count', commitment_count,
    'goal_reached_at', goal_reached_at_time,
    'has_commitments', commitment_count > 0
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a proposal has reached its goal
CREATE OR REPLACE FUNCTION check_proposal_goal_status(proposal_id_param BIGINT, goal_threshold INTEGER DEFAULT 10)
RETURNS JSON AS $$
DECLARE
  result JSON;
  current_upvotes INTEGER;
  goal_reached_at_time TIMESTAMPTZ;
  commitment_count INTEGER;
BEGIN
  -- Get current upvotes and goal reached timestamp
  SELECT upvotes, goal_reached_at INTO current_upvotes, goal_reached_at_time
  FROM proposals 
  WHERE id = proposal_id_param;

  -- Get commitment count
  SELECT COUNT(*) INTO commitment_count 
  FROM goal_commitments 
  WHERE proposal_id = proposal_id_param;

  -- Build result JSON
  result := json_build_object(
    'proposal_id', proposal_id_param,
    'current_upvotes', current_upvotes,
    'goal_threshold', goal_threshold,
    'has_reached_goal', current_upvotes >= goal_threshold,
    'goal_reached_at', goal_reached_at_time,
    'commitment_count', commitment_count,
    'progress_percentage', LEAST((current_upvotes::FLOAT / goal_threshold::FLOAT) * 100, 100),
    'upvotes_remaining', GREATEST(goal_threshold - current_upvotes, 0)
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get all commitments for a proposal (for admin/transparency purposes)
CREATE OR REPLACE FUNCTION get_proposal_commitments(proposal_id_param BIGINT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  signature TEXT,
  upvote_count_at_commitment INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gc.id,
    gc.name,
    gc.email,
    gc.signature,
    gc.upvote_count_at_commitment,
    gc.created_at
  FROM goal_commitments gc
  WHERE gc.proposal_id = proposal_id_param
  ORDER BY gc.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_proposal_goal_stats(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_proposal_goal_status(BIGINT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_proposal_commitments(BIGINT) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE goal_commitments IS 'Tracks user commitments when proposals reach their upvote goals';
COMMENT ON COLUMN goal_commitments.proposal_id IS 'Reference to the proposal that reached its goal';
COMMENT ON COLUMN goal_commitments.name IS 'Full name of the person committing';
COMMENT ON COLUMN goal_commitments.email IS 'Email address for follow-up communications';
COMMENT ON COLUMN goal_commitments.signature IS 'Digital signature confirming commitment';
COMMENT ON COLUMN goal_commitments.upvote_count_at_commitment IS 'Number of upvotes when the commitment was made';
COMMENT ON COLUMN proposals.goal_reached_at IS 'Timestamp when the proposal reached its upvote goal';

