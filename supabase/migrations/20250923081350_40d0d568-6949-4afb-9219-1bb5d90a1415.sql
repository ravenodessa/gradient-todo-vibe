-- Fix security issue: Restrict profile access to authenticated users only
-- Drop the overly permissive policy that allows everyone to view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a more secure policy that only allows authenticated users to view profiles
-- This prevents anonymous users from accessing user data
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Optional: If you want even more restrictive access (users can only see their own profiles)
-- Uncomment the following and comment out the above policy:
-- CREATE POLICY "Users can view their own profile" 
-- ON public.profiles 
-- FOR SELECT 
-- TO authenticated
-- USING (auth.uid() = user_id);