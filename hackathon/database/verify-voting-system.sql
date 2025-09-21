-- Verification script for voting system
-- Run this to check that upvotes and downvotes are properly calculated

-- Step 1: Detailed vote count verification per proposal
SELECT
  p.id,
  p.title,
  p.upvotes,
  p.downvotes,
  (p.upvotes - p.downvotes) as net_score,
  COUNT(v.id) as total_votes,
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

-- Step 2: Summary of voting system status
SELECT
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
