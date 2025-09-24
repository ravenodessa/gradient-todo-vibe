-- Add due_date column to todos table
ALTER TABLE public.todos 
ADD COLUMN due_date DATE;

-- Add comment for the new column
COMMENT ON COLUMN public.todos.due_date IS 'Due date for the todo item';