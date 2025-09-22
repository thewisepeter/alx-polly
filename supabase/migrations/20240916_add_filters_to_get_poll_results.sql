-- Drop the old function
DROP FUNCTION IF EXISTS get_poll_results(UUID, UUID, TEXT);

-- Create the new function with optional filters
CREATE OR REPLACE FUNCTION get_poll_results(
  poll_id UUID,
  filter_user_id UUID DEFAULT NULL,
  filter_anonymous_user_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  option_id UUID,
  option_text TEXT,
  total_votes BIGINT,
  user_voted BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    po.id AS option_id,
    po.option_text,
    COUNT(v.id) AS total_votes,
    -- Mark if the current user (or anon) voted for this option
    BOOL_OR(
      (filter_user_id IS NOT NULL AND v.user_id = filter_user_id) OR
      (filter_anonymous_user_id IS NOT NULL AND v.anonymous_user_id = filter_anonymous_user_id)
    ) AS user_voted
  FROM 
    poll_options po
  LEFT JOIN 
    votes v ON po.id = v.option_id
  WHERE 
    po.poll_id = get_poll_results.poll_id
  GROUP BY 
    po.id, po.option_text
  ORDER BY 
    total_votes DESC, po.option_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
