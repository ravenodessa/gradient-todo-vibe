
CREATE TABLE public.favorite_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  recurrence_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.favorite_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorite tasks"
ON public.favorite_tasks FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorite tasks"
ON public.favorite_tasks FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorite tasks"
ON public.favorite_tasks FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite tasks"
ON public.favorite_tasks FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_favorite_tasks_updated_at
  BEFORE UPDATE ON public.favorite_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
