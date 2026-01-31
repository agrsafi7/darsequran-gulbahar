-- Create live streams settings table
CREATE TABLE public.live_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE CHECK (platform IN ('youtube', 'facebook')),
  stream_url TEXT NOT NULL DEFAULT '',
  is_live BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

-- Everyone can read live stream status
CREATE POLICY "Anyone can view live streams"
ON public.live_streams
FOR SELECT
USING (true);

-- Only admins can modify live streams
CREATE POLICY "Admins can manage live streams"
ON public.live_streams
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_live_streams_updated_at
BEFORE UPDATE ON public.live_streams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default rows for YouTube and Facebook
INSERT INTO public.live_streams (platform, stream_url, is_live)
VALUES 
  ('youtube', '', false),
  ('facebook', '', false);