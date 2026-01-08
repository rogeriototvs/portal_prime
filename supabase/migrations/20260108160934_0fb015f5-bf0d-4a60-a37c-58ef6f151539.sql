-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'client');

-- Table for authorized T codes (clients)
CREATE TABLE public.authorized_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    t_code TEXT NOT NULL UNIQUE,
    company_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for admin users
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for announcements/communications
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for portal settings (Google Calendar ID, etc.)
CREATE TABLE public.portal_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for client sessions (track T code access)
CREATE TABLE public.client_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    t_code TEXT NOT NULL REFERENCES public.authorized_codes(t_code) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.authorized_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_sessions ENABLE ROW LEVEL SECURITY;

-- Function to check if user is admin (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = _user_id
  )
$$;

-- RLS Policies for authorized_codes
CREATE POLICY "Anyone can check if code exists" ON public.authorized_codes
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert codes" ON public.authorized_codes
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update codes" ON public.authorized_codes
    FOR UPDATE TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete codes" ON public.authorized_codes
    FOR DELETE TO authenticated
    USING (public.is_admin(auth.uid()));

-- RLS Policies for admin_users
CREATE POLICY "Admins can view admin list" ON public.admin_users
    FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage admins" ON public.admin_users
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()));

-- RLS Policies for announcements
CREATE POLICY "Anyone can view active announcements" ON public.announcements
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage announcements" ON public.announcements
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()));

-- RLS Policies for portal_settings
CREATE POLICY "Anyone can view settings" ON public.portal_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON public.portal_settings
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()));

-- RLS Policies for client_sessions
CREATE POLICY "Anyone can create session" ON public.client_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view own session" ON public.client_sessions
    FOR SELECT USING (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_authorized_codes_updated_at
    BEFORE UPDATE ON public.authorized_codes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portal_settings_updated_at
    BEFORE UPDATE ON public.portal_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();