-- Fix permissive RLS policy on client_sessions
-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "Anyone can create session" ON public.client_sessions;

-- Create a more specific policy that validates the t_code exists
CREATE POLICY "Allow session creation for valid codes" ON public.client_sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.authorized_codes 
            WHERE t_code = client_sessions.t_code 
            AND is_active = true
        )
    );