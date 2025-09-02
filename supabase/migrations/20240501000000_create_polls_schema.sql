-- Create extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT TRUE,
  allow_anonymous_votes BOOLEAN DEFAULT TRUE,
  end_date TIMESTAMP WITH TIME ZONE
);

-- Create poll options table
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, option_text)
);

-- Create votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  UNIQUE(poll_id, user_id), -- Prevent duplicate votes from the same user
  CONSTRAINT user_or_anonymous CHECK (
    (user_id IS NOT NULL AND anonymous_user_id IS NULL) OR
    (user_id IS NULL AND anonymous_user_id IS NOT NULL)
  )
);

-- Create poll_shares table for tracking QR code shares
CREATE TABLE poll_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  share_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_polls_created_by ON polls(created_by);
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_option_id ON votes(option_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_poll_shares_poll_id ON poll_shares(poll_id);
CREATE INDEX idx_poll_shares_share_code ON poll_shares(share_code);

-- Row Level Security Policies

-- Polls: Users can view public polls or polls they created
CREATE POLICY "Users can view their own polls and public polls" 
  ON polls FOR SELECT 
  USING (is_public OR created_by = auth.uid());

-- Polls: Users can insert their own polls
CREATE POLICY "Users can insert their own polls" 
  ON polls FOR INSERT 
  WITH CHECK (created_by = auth.uid());

-- Polls: Users can update their own polls
CREATE POLICY "Users can update their own polls" 
  ON polls FOR UPDATE 
  USING (created_by = auth.uid());

-- Polls: Users can delete their own polls
CREATE POLICY "Users can delete their own polls" 
  ON polls FOR DELETE 
  USING (created_by = auth.uid());

-- Poll Options: Anyone can view options for polls they can see
CREATE POLICY "Anyone can view options for visible polls" 
  ON poll_options FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id 
      AND (polls.is_public OR polls.created_by = auth.uid())
    )
  );

-- Poll Options: Users can insert options for their own polls
CREATE POLICY "Users can insert options for their own polls" 
  ON poll_options FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

-- Poll Options: Users can update options for their own polls
CREATE POLICY "Users can update options for their own polls" 
  ON poll_options FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

-- Poll Options: Users can delete options for their own polls
CREATE POLICY "Users can delete options for their own polls" 
  ON poll_options FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

-- Votes: Anyone can view votes for polls they can see
CREATE POLICY "Anyone can view votes for visible polls" 
  ON votes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = votes.poll_id 
      AND (polls.is_public OR polls.created_by = auth.uid())
    )
  );

-- Votes: Authenticated users can vote on polls
CREATE POLICY "Authenticated users can vote" 
  ON votes FOR INSERT 
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = votes.poll_id 
      AND polls.allow_anonymous_votes = TRUE
    )
  );

-- Votes: Users can update their own votes
CREATE POLICY "Users can update their own votes" 
  ON votes FOR UPDATE 
  USING (user_id = auth.uid());

-- Votes: Users can delete their own votes
CREATE POLICY "Users can delete their own votes" 
  ON votes FOR DELETE 
  USING (user_id = auth.uid());

-- Poll Shares: Anyone can view shares for polls they can see
CREATE POLICY "Anyone can view shares for visible polls" 
  ON poll_shares FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_shares.poll_id 
      AND (polls.is_public OR polls.created_by = auth.uid())
    )
  );

-- Poll Shares: Users can create shares for their own polls
CREATE POLICY "Users can create shares for their own polls" 
  ON poll_shares FOR INSERT 
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_shares.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

-- Poll Shares: Users can delete shares for their own polls
CREATE POLICY "Users can delete shares for their own polls" 
  ON poll_shares FOR DELETE 
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_shares.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

-- Create functions for vote counting
CREATE OR REPLACE FUNCTION get_poll_results(poll_id UUID)
RETURNS TABLE (
  option_id UUID,
  option_text TEXT,
  vote_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    po.id AS option_id,
    po.option_text,
    COUNT(v.id) AS vote_count
  FROM 
    poll_options po
  LEFT JOIN 
    votes v ON po.id = v.option_id
  WHERE 
    po.poll_id = get_poll_results.poll_id
  GROUP BY 
    po.id, po.option_text
  ORDER BY 
    vote_count DESC, po.option_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has voted
CREATE OR REPLACE FUNCTION has_user_voted(poll_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM votes
    WHERE votes.poll_id = has_user_voted.poll_id
    AND votes.user_id = has_user_voted.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;