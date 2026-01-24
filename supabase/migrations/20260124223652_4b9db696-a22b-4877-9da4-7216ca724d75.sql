-- Create table for Dars-e-Quran audio content
CREATE TABLE public.dars_audio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  duration TEXT,
  file_size TEXT,
  category TEXT NOT NULL CHECK (category IN ('listen', 'download', 'complete')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dars_audio ENABLE ROW LEVEL SECURITY;

-- Public can view published audio
CREATE POLICY "Anyone can view published audio"
ON public.dars_audio
FOR SELECT
USING (is_published = true);

-- Admins can manage all audio
CREATE POLICY "Admins can manage audio"
ON public.dars_audio
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_dars_audio_updated_at
BEFORE UPDATE ON public.dars_audio
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();