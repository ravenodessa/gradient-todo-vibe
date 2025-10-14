-- Add notes column to todos table
ALTER TABLE public.todos 
ADD COLUMN notes TEXT;

-- Add a check constraint to limit notes to 200 characters
ALTER TABLE public.todos 
ADD CONSTRAINT notes_length_check CHECK (length(notes) <= 200);