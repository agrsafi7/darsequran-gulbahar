
-- Drop the overly permissive comment policy
DROP POLICY IF EXISTS "Anyone can submit comments" ON public.comments;

-- Create a more restrictive comment insert policy that validates required fields
CREATE POLICY "Public can submit comments with valid data" ON public.comments
    FOR INSERT 
    WITH CHECK (
        author_name IS NOT NULL 
        AND author_email IS NOT NULL 
        AND content IS NOT NULL 
        AND post_id IS NOT NULL
        AND status = 'pending'
    );
