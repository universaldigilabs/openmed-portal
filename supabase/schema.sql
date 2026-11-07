-- ==============================================================================
-- ZERO-COST MEDICAL INTAKE & COORDINATOR DATABASE SCHEMA
-- Platform: Supabase (PostgreSQL 15+)
-- Storage Bucket: patient-docs
-- Tables: medical_cases, notification_log
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Sequence for human-readable case IDs (MC-1001, MC-1002, etc.)
CREATE SEQUENCE IF NOT EXISTS public.medical_case_number_seq START WITH 1001;

-- ==============================================================================
-- TABLE: medical_cases
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medical_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT UNIQUE NOT NULL DEFAULT ('MC-' || nextval('public.medical_case_number_seq'::regclass)::TEXT),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    patient_name TEXT,
    patient_email TEXT,
    patient_phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    
    chief_complaint TEXT,
    symptoms_description TEXT,
    urgency_level TEXT NOT NULL DEFAULT 'routine',
    
    status TEXT NOT NULL DEFAULT 'submitted',
    assigned_coordinator TEXT,
    coordinator_notes TEXT,
    
    documents JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Ensure all columns exist if table was previously created with minimal columns
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS case_number TEXT;
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS patient_email TEXT;
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS patient_phone TEXT;
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS chief_complaint TEXT;
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS symptoms_description TEXT;
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS urgency_level TEXT DEFAULT 'routine';
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'submitted';
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS assigned_coordinator TEXT;
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS coordinator_notes TEXT;
ALTER TABLE public.medical_cases ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

-- Default case number if missing
ALTER TABLE public.medical_cases ALTER COLUMN case_number SET DEFAULT ('MC-' || nextval('public.medical_case_number_seq'::regclass)::TEXT);

-- ==============================================================================
-- TABLE: notification_log
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    case_id UUID REFERENCES public.medical_cases(id) ON DELETE CASCADE,
    
    recipient TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'email',
    event_type TEXT NOT NULL DEFAULT 'case_submitted',
    subject TEXT,
    message_body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent',
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_medical_cases_status ON public.medical_cases (status);
CREATE INDEX IF NOT EXISTS idx_medical_cases_urgency ON public.medical_cases (urgency_level);
CREATE INDEX IF NOT EXISTS idx_medical_cases_created_at ON public.medical_cases (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_cases_patient_email ON public.medical_cases (patient_email);
CREATE INDEX IF NOT EXISTS idx_medical_cases_case_number ON public.medical_cases (case_number);

CREATE INDEX IF NOT EXISTS idx_notification_log_case_id ON public.notification_log (case_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_created_at ON public.notification_log (created_at DESC);

-- ==============================================================================
-- GRANTS & PERMISSIONS (Crucial for PostgREST & Supabase API)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.medical_cases TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.notification_log TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.medical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- Medical Cases Policies
DROP POLICY IF EXISTS "Public anonymous users can submit intake cases" ON public.medical_cases;
CREATE POLICY "Public anonymous users can submit intake cases"
    ON public.medical_cases
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Coordinators have full access to medical cases" ON public.medical_cases;
CREATE POLICY "Coordinators have full access to medical cases"
    ON public.medical_cases
    FOR ALL
    TO authenticated, service_role
    USING (true)
    WITH CHECK (true);

-- Notification Log Policies
DROP POLICY IF EXISTS "Authenticated users can view notification logs" ON public.notification_log;
CREATE POLICY "Authenticated users can view notification logs"
    ON public.notification_log
    FOR SELECT
    TO authenticated, service_role
    USING (true);

DROP POLICY IF EXISTS "Authenticated users or server can insert notification logs" ON public.notification_log;
CREATE POLICY "Authenticated users or server can insert notification logs"
    ON public.notification_log
    FOR INSERT
    TO authenticated, service_role
    WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKET: patient-docs
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'patient-docs',
    'patient-docs',
    false, -- Private bucket
    20971520, -- 20MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/dicom']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 20971520;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Allow public intake file uploads" ON storage.objects;
CREATE POLICY "Allow public intake file uploads"
    ON storage.objects
    FOR INSERT
    TO anon, authenticated, service_role
    WITH CHECK (bucket_id = 'patient-docs');

DROP POLICY IF EXISTS "Allow coordinators to view patient documents" ON storage.objects;
CREATE POLICY "Allow coordinators to view patient documents"
    ON storage.objects
    FOR SELECT
    TO authenticated, service_role
    USING (bucket_id = 'patient-docs');

-- ==============================================================================
-- RELOAD SCHEMA CACHE
-- ==============================================================================
NOTIFY pgrst, 'reload schema';
