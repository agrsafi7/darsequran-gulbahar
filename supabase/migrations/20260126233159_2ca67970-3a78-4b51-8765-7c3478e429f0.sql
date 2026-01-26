-- Create table for Dars-e-Quran category cards
CREATE TABLE public.dars_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  href text NOT NULL,
  icon text NOT NULL DEFAULT 'Headphones',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dars_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view visible categories"
ON public.dars_categories
FOR SELECT
USING (is_visible = true);

CREATE POLICY "Admins can manage categories"
ON public.dars_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed default data
INSERT INTO public.dars_categories (title, description, href, icon, sort_order) VALUES
('Listen Online Dars', 'Stream Quran lessons directly in your browser. Access our complete library of audio recordings.', '/dars-e-quran/listen', 'Headphones', 1),
('Download Dars', 'Download individual lessons to listen offline. Perfect for learning on the go.', '/dars-e-quran/download', 'Download', 2),
('Complete Dars (Single File)', 'Download complete compilations as single files for uninterrupted listening experience.', '/dars-e-quran/complete', 'FileAudio', 3);