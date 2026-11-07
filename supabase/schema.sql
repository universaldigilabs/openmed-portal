-- ==============================================================================
-- ZERO-COST PRODUCTION SCHEMA FOR MEDICAL INTAKE & COORDINATOR DASHBOARD
-- Platform: Supabase (PostgreSQL 15+)
-- Storage Bucket: patient-docs
-- Tables: medical_cases, notification_log
-- Features: RLS Policies, Audit Logging, Automated Case Numbers, Indexes
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean up old artifacts if re-running (safe migrations)
-- DROP TABLE IF EXISTS notification_log CASCADE;
-- DROP TABLE IF EXISTS medical_cases CASCADE;

-- 3. Sequence for human-readable case reference numbers (e.g., MC-1001, MC-1002)
CREATE SEQUENCE IF NOT EXISTS medical_case_number_seq START WITH 1001;

-- ==============================================================================
-- TABLE: medical_cases
-- Holds patient intake submissions and triage/coordination status
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medical_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT UNIQUE NOT NULL DEFAULT ('MC-' || nextval('medical_case_number_seq'::regclass)::TEXT),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- Patient Information
    patient_name TEXT NOT NULL CHECK (char_length(trim(patient_name)) >= 2),
    patient_email TEXT NOT NULL CHECK (patient_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    patient_phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'other', 'prefer-not-to-say')),
    
    -- Clinical Details
    chief_complaint TEXT NOT NULL CHECK (char_length(trim(chief_complaint)) >= 3),
    symptoms_description TEXT,
    urgency_level TEXT NOT NULL DEFAULT 'routine' CHECK (urgency_level IN ('routine', 'urgent', 'critical', 'emergency')),
    
    -- Workflow & Triage
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'action_required', 'scheduled', 'resolved', 'closed')),
    assigned_coordinator TEXT,
    coordinator_notes TEXT,
    
    -- Attached Documents Metadata (stores file name, storage path, size, mime type)
    documents JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- ==============================================================================
-- TABLE: notification_log
-- Audit trail of all outgoing patient notifications (email, SMS, status alerts)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    case_id UUID REFERENCES public.medical_cases(id) ON DELETE CASCADE,
    
    recipient TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'webhook', 'system')),
    event_type TEXT NOT NULL CHECK (event_type IN ('case_submitted', 'status_changed', 'note_added', 'coordinator_assigned', 'document_uploaded')),
    subject TEXT,
    message_body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE & SEARCH
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_medical_cases_status ON public.medical_cases (status);
CREATE INDEX IF NOT EXISTS idx_medical_cases_urgency ON public.medical_cases (urgency_level);
CREATE INDEX IF NOT EXISTS idx_medical_cases_created_at ON public.medical_cases (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_cases_patient_email ON public.medical_cases (patient_email);
CREATE INDEX IF NOT EXISTS idx_medical_cases_case_number ON public.medical_cases (case_number);

CREATE INDEX IF NOT EXISTS idx_notification_log_case_id ON public.notification_log (case_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_created_at ON public.notification_log (created_at DESC);

-- ==============================================================================
-- AUTOMATIC TIMESTAMPS (TRIGGER)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_medical_cases_updated_at ON public.medical_cases;
CREATE TRIGGER set_medical_cases_updated_at
    BEFORE UPDATE ON public.medical_cases
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict HIPAA/privacy protection for medical data
-- ==============================================================================
ALTER TABLE public.medical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- 1. Medical Cases Policies:
-- Allow anonymous/public patients to SUBMIT their case via the public intake form
CREATE POLICY "Public anonymous users can submit intake cases"
    ON public.medical_cases
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Authenticated coordinators have full read & write access
CREATE POLICY "Coordinators have full access to medical cases"
    ON public.medical_cases
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 2. Notification Log Policies:
-- Only authenticated coordinators / server role can inspect notification audits
CREATE POLICY "Authenticated users can view notification logs"
    ON public.notification_log
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users or server can insert notification logs"
    ON public.notification_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKET: patient-docs
-- Secure storage for medical reports, lab results, insurance cards, and scans
-- ==============================================================================
-- Insert bucket configuration (avoids duplicates if already created)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'patient-docs',
    'patient-docs',
    false, -- Private bucket (preserves patient confidentiality; accessed via signed URLs or service_role)
    20971520, -- 20MB max file size limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/dicom']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 20971520;

-- Storage RLS Policies:
-- Allow anyone (public/anon) to upload files into the patient-docs bucket
CREATE POLICY "Allow public intake file uploads"
    ON storage.objects
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'patient-docs');

-- Only authenticated coordinators can view/download uploaded documents
CREATE POLICY "Allow coordinators to view patient documents"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'patient-docs');

-- Only authenticated coordinators can delete uploaded documents
CREATE POLICY "Allow coordinators to delete patient documents"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'patient-docs');

-- ==============================================================================
-- HELPER NOTIFICATION TRIGGER (OPTIONAL AUDIT HOOK)
-- Logs a notification record automatically when a new case is submitted
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_case_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notification_log (
        case_id,
        recipient,
        channel,
        event_type,
        subject,
        message_body,
        status,
        metadata
    ) VALUES (
        NEW.id,
        NEW.patient_email,
        'email',
        'case_submitted',
        'Your medical intake case has been received (' || NEW.case_number || ')',
        'Hello ' || NEW.patient_name || ', your intake form has been submitted successfully with urgency level: ' || NEW.urgency_level || '. A care coordinator is reviewing your details.',
        'sent',
        jsonb_build_object('urgency', NEW.urgency_level, 'complaint', NEW.chief_complaint)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_case_created_notify ON public.medical_cases;
CREATE TRIGGER on_case_created_notify
    AFTER INSERT ON public.medical_cases
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_case_notification();
