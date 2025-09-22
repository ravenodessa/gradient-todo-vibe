-- Add archived column to todos table
ALTER TABLE public.todos 
ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance on archived field
CREATE INDEX idx_todos_archived ON public.todos(archived);

-- Create index for better performance on user_id, archived combination
CREATE INDEX idx_todos_user_archived ON public.todos(user_id, archived);