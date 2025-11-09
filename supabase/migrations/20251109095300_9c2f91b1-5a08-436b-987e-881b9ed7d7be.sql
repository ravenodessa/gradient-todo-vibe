-- Add reminder_time column to todos table
ALTER TABLE public.todos 
ADD COLUMN reminder_time TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for reminder_time for better query performance
CREATE INDEX idx_todos_reminder_time ON public.todos(reminder_time) WHERE reminder_time IS NOT NULL;