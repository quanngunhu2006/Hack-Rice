-- Create Interest table for storing form submissions
CREATE TABLE IF NOT EXISTS public.interest (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id BIGINT REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  digital_sig TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on interest table
ALTER TABLE interest ENABLE ROW LEVEL SECURITY;

-- Create policies for interest table
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anyone can view interest submissions" ON interest;
    CREATE POLICY "Anyone can view interest submissions" ON interest FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Users can create interest submissions" ON interest;
    CREATE POLICY "Users can create interest submissions" ON interest FOR INSERT WITH CHECK (true);
END$$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_interest_proposal_id ON interest(proposal_id);
CREATE INDEX IF NOT EXISTS idx_interest_email ON interest(email);
