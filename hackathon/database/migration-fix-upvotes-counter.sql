-- Migration to fix upvotes and downvotes counters based on existing votes
-- Run this in your Supabase SQL Editor to update vote counters
-- This ensures the counters match the actual votes in the database

-- Step 1: Update vote counters based on actual votes in votes table
UPDATE proposals
SET
  upvotes = (
    SELECT COUNT(*)
    FROM votes
    WHERE votes.proposal_id = proposals.id
    AND votes.vote_type = 'up'
  ),
  downvotes = (
    SELECT COUNT(*)
    FROM votes
    WHERE votes.proposal_id = proposals.id
    AND votes.vote_type = 'down'
  );

-- Step 2: Ensure no NULL values in vote counters (for data integrity)
UPDATE proposals
SET
  upvotes = COALESCE(upvotes, 0),
  downvotes = COALESCE(downvotes, 0);

-- Step 3: Verify the vote counts are correct
SELECT
  p.id,
  p.title,
  p.upvotes,
  p.downvotes,
  (p.upvotes - p.downvotes) as net_score,
  COUNT(v.id) as total_votes,
  COUNT(CASE WHEN v.vote_type = 'up' THEN 1 END) as up_votes,
  COUNT(CASE WHEN v.vote_type = 'down' THEN 1 END) as down_votes,
  CASE
    WHEN p.upvotes = COUNT(CASE WHEN v.vote_type = 'up' THEN 1 END) THEN 'MATCH'
    ELSE 'MISMATCH'
  END as upvotes_match,
  CASE
    WHEN p.downvotes = COUNT(CASE WHEN v.vote_type = 'down' THEN 1 END) THEN 'MATCH'
    ELSE 'MISMATCH'
  END as downvotes_match
FROM proposals p
LEFT JOIN votes v ON p.id = v.proposal_id
GROUP BY p.id, p.title, p.upvotes, p.downvotes
ORDER BY p.created_at DESC;
