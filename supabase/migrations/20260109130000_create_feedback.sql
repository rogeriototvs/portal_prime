-- Table for client feedback (complaints/compliments)
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    t_code TEXT NOT NULL REFERENCES public.authorized_codes(t_code) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('complaint', 'compliment')),
    subject TEXT,
    message TEXT NOT NULL,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Clients (anon) can insert feedback for valid/active codes
CREATE POLICY "Allow feedback insertion for valid codes" ON public.feedback
    FOR INSERT TO anon, authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.authorized_codes
            WHERE t_code = feedback.t_code
            AND is_active = true
        )
    );

-- Admins can view/manage feedback
CREATE POLICY "Admins can view feedback" ON public.feedback
    FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage feedback" ON public.feedback
    FOR UPDATE TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete feedback" ON public.feedback
    FOR DELETE TO authenticated
    USING (public.is_admin(auth.uid()));
