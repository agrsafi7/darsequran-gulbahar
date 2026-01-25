-- Create categories table for dynamic category management
CREATE TABLE public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create playlists table for grouping audio
CREATE TABLE public.dars_playlists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'listen',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dars_playlists ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view published playlists"
ON public.dars_playlists
FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage playlists"
ON public.dars_playlists
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_dars_playlists_updated_at
BEFORE UPDATE ON public.dars_playlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add playlist_id to dars_audio for grouping
ALTER TABLE public.dars_audio
ADD COLUMN playlist_id UUID REFERENCES public.dars_playlists(id) ON DELETE SET NULL;

-- Insert default categories based on existing usage
INSERT INTO public.categories (name, slug, sort_order) VALUES
('Dars-e-Quran', 'dars-e-quran', 1),
('Speeches', 'speeches', 2),
('Books', 'books', 3),
('Articles', 'articles', 4),
('Announcements', 'announcements', 5);