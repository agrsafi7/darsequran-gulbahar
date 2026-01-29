-- Create post_views table to track individual post views
CREATE TABLE public.post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  viewer_ip TEXT,
  user_agent TEXT
);

-- Create index for faster queries
CREATE INDEX idx_post_views_post_id ON public.post_views(post_id);
CREATE INDEX idx_post_views_viewed_at ON public.post_views(viewed_at);

-- Enable RLS
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (anonymous tracking)
CREATE POLICY "Anyone can add views"
ON public.post_views
FOR INSERT
WITH CHECK (true);

-- Admins can view all views for analytics
CREATE POLICY "Admins can view all post views"
ON public.post_views
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Also allow public to count views (for display purposes)
CREATE POLICY "Anyone can count views"
ON public.post_views
FOR SELECT
USING (true);

-- Create a view for aggregated post view counts (more efficient queries)
CREATE OR REPLACE VIEW public.post_view_counts AS
SELECT 
  post_id,
  COUNT(*) as total_views,
  COUNT(DISTINCT viewed_at::date) as unique_days,
  MAX(viewed_at) as last_viewed
FROM public.post_views
GROUP BY post_id;