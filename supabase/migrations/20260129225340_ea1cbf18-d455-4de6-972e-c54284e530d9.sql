-- Add category_id column to navigation_items to link with categories table
ALTER TABLE public.navigation_items 
ADD COLUMN category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add comment explaining the column
COMMENT ON COLUMN public.navigation_items.category_id IS 'If set, this nav item will automatically show the category''s children as dropdown items';