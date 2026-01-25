-- Add playlist_embed_url column to posts table
ALTER TABLE public.posts 
ADD COLUMN playlist_embed_url text;