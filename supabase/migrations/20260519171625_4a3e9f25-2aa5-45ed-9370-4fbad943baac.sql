ALTER TABLE public.favorite_tasks ADD COLUMN pinned BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX idx_favorite_tasks_pinned ON public.favorite_tasks(user_id, pinned, created_at DESC);