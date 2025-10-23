-- Add order_index column to todos table for drag and drop ordering
ALTER TABLE public.todos 
ADD COLUMN order_index INTEGER DEFAULT 0;

-- Create index for better performance when sorting
CREATE INDEX idx_todos_order ON public.todos(user_id, order_index);