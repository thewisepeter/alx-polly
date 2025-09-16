-- Drop the old function
DROP FUNCTION IF EXISTS get_poll_results(UUID);

-- Create the new function with filtering parameters
CREATE OR REPLACE FUNCTION get_poll_results(
  poll_id UUID,
  filter_user_id UUID DEFAULT NULL,
  filter_anonymous_user_id TEXT DEFAULT NULL
)
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
    AND (filter_user_id IS NULL OR v.user_id = filter_user_id)
    AND (filter_anonymous_user_id IS NULL OR v.anonymous_user_id = filter_anonymous_user_id)
  GROUP BY 
    po.id, po.option_text
  ORDER BY 
    vote_count DESC, po.option_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
