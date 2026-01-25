-- Add archive_item_id field to posts table for fetching download lists
ALTER TABLE public.posts 
ADD COLUMN archive_item_id text DEFAULT NULL;