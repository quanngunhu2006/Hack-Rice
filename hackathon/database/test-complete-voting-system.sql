-- Complete test script for voting system
-- This tests the entire voting flow from database to frontend

-- Step 1: Check current vote counts (initial state)
SELECT
  p.id,
  p.title,
  p.upvotes,
  p.downvotes,
  (p.upvotes - p.downvotes) as net_score,
  COUNT(v.id) as actual_votes,
  COUNT(CASE WHEN v.vote_type = 'up' THEN 1 END) as actual_up_votes,
  COUNT(CASE WHEN v.vote_type = 'down' THEN 1 END) as actual_down_votes
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

-- Step 3: Verify vote counts match after test votes
SELECT
  p.id,
  p.title,
  p.upvotes,
  p.downvotes,
  (p.upvotes - p.downvotes) as net_score,
  COUNT(v.id) as actual_votes,
  COUNT(CASE WHEN v.vote_type = 'up' THEN 1 END) as actual_up_votes,
  COUNT(CASE WHEN v.vote_type = 'down' THEN 1 END) as actual_down_votes,
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

-- Step 4: Test vote removal (toggle)
-- SELECT cast_vote(1, 'up', 'demo-user-id') AS test_remove_vote;

-- Step 5: Final verification and status summary
SELECT
  'Voting System Status' as status_check,
  COUNT(*) as total_proposals,
  COUNT(CASE WHEN upvotes_match = 'MATCH' AND downvotes_match = 'MATCH' THEN 1 END) as correctly_counted,
  COUNT(CASE WHEN upvotes_match = 'MISMATCH' OR downvotes_match = 'MISMATCH' THEN 1 END) as incorrectly_counted,
  COUNT(CASE WHEN upvotes_match = 'MATCH' AND downvotes_match = 'MATCH' THEN 1 END) * 100.0 / COUNT(*) as accuracy_percentage
FROM (
  SELECT
    p.id,
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
  GROUP BY p.id, p.upvotes, p.downvotes
) as verification;
