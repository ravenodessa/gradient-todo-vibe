-- Add recurrence_type column to todos table
ALTER TABLE public.todos
ADD COLUMN recurrence_type text CHECK (recurrence_type IN ('daily', 'weekdays', 'weekends'));

-- Add comment to explain the column
COMMENT ON COLUMN public.todos.recurrence_type IS 'Type of task recurrence: daily, weekdays, or weekends. NULL means no recurrence.';