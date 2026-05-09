-- 1. Restrict todos policies to authenticated role
DROP POLICY IF EXISTS "Users can view their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can create their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON public.todos;

CREATE POLICY "Users can view their own todos"
ON public.todos FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own todos"
ON public.todos FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
ON public.todos FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
ON public.todos FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 2. Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated
-- These functions are only used internally by triggers.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 3. Restrict listing on the public avatars bucket
-- Public URLs continue to work without a SELECT policy because the bucket is public,
-- but this removes the ability to list every file in the bucket.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;

-- Allow each user to read only their own files inside the avatars bucket.
CREATE POLICY "Users can view their own avatar files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);