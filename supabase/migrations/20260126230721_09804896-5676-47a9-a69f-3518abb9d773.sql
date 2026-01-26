-- Add button fields to hero_slides table
ALTER TABLE public.hero_slides
ADD COLUMN button1_text text DEFAULT 'Explore Dars-e-Quran',
ADD COLUMN button1_url text DEFAULT '/dars-e-quran',
ADD COLUMN button2_text text DEFAULT 'Learn More',
ADD COLUMN button2_url text DEFAULT '/about';

-- Update existing slides with default button values
UPDATE public.hero_slides
SET 
  button1_text = 'Explore Dars-e-Quran',
  button1_url = '/dars-e-quran',
  button2_text = 'Learn More',
  button2_url = '/about'
WHERE button1_text IS NULL;