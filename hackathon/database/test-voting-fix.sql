-- Test script to verify voting system works correctly with single increments
-- This script tests the database function cast_vote to ensure it increments counters by 1 only

-- Step 1: Check current vote state before testing
SELECT
  p.id,
  p.title,
  p.upvotes,
  p.downvotes,
  (p.upvotes - p.downvotes) as net_score,
  COUNT(v.id) as actual_votes,
  COUNT(CASE WHEN v.vote_type = 'up' THEN 1 END) as up_votes,
  COUNT(CASE WHEN v.vote_type = 'down' THEN 1 END) as down_votes
FROM proposals p
LEFT JOIN votes v ON p.id = v.proposal_id
GROUP BY p.id, p.title, p.upvotes, p.downvotes
ORDER BY p.created_at DESC;

-- Step 2: Test the cast_vote function directly
-- Note: Replace 'demo-user-id' with an actual user ID from your profiles table
-- Uncomment the lines below to run actual tests:

-- Test upvote function (should increment upvotes by 1 only)
-- SELECT cast_vote(1, 'up', 'demo-user-id') AS test_upvote;

-- Test downvote function (should increment downvotes by 1 only)
-- SELECT cast_vote(1, 'down', 'demo-user-id') AS test_downvote;

-- Test vote removal (toggle off)
-- SELECT cast_vote(1, 'up', 'demo-user-id') AS test_remove_vote;

-- Step 3: Verify vote counts after test votes
SELECT
  p.id,
  p.title,
  p.upvotes,
  p.downvotes,
  (p.upvotes - p.downvotes) as net_score,
  COUNT(v.id) as actual_votes,
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

-- Summary: Expected voting system behavior:
-- - Each upvote increments upvotes by 1
-- - Each downvote increments downvotes by 1
-- - Net score = upvotes - downvotes
-- - No double counting should occur
-- - Function should return: success = true, vote_type = 'up'|'down'|NULL
