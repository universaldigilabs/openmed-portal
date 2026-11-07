import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isSupabaseConfigured, mockCases, mockNotifications, getNextCaseNumber } from '@/lib/mock-store';
import { MedicalCase } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');
    const search = searchParams.get('search');

    if (isSupabaseConfigured()) {
      try {
        let query = supabaseAdmin
          .from('medical_cases')
          .select('*')
          .order('created_at', { ascending: false });

        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        if (urgency && urgency !== 'all') {
          query = query.eq('urgency_level', urgency);
        }

        if (search) {
          query = query.or(
            `patient_name.ilike.%${search}%,patient_email.ilike.%${search}%,case_number.ilike.%${search}%,chief_complaint.ilike.%${search}%`
          );
        }

        const { data, error } = await query;
        if (!error && data) {
          return NextResponse.json({ cases: data, source: 'supabase' });
        }
      } catch (e) {
        console.warn('Falling back to local mock store due to Supabase error:', e);
      }
    }

    // Local in-memory mock store for instant testing
    let filtered = [...mockCases];

    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status === status);
    }

    if (urgency && urgency !== 'all') {
      filtered = filtered.filter((c) => c.urgency_level === urgency);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.patient_name.toLowerCase().includes(q) ||
          c.patient_email.toLowerCase().includes(q) ||
          c.case_number.toLowerCase().includes(q) ||
          c.chief_complaint.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ cases: filtered, source: 'local-test-mode' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      patient_name,
      patient_email,
      patient_phone,
      date_of_birth,
      gender,
      chief_complaint,
      symptoms_description,
      urgency_level,
      documents,
    } = body;

    if (!patient_name || !patient_email || !chief_complaint) {
      return NextResponse.json(
        { error: 'Patient name, email, and chief complaint are required fields.' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from('medical_cases')
          .insert([
            {
              patient_name,
              patient_email,
              patient_phone: patient_phone || null,
              date_of_birth: date_of_birth || null,
              gender: gender || null,
              chief_complaint,
              symptoms_description: symptoms_description || null,
              urgency_level: urgency_level || 'routine',
              status: 'submitted',
              documents: documents || [],
            },
          ])
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, case: data, source: 'supabase' }, { status: 201 });
        }
      } catch (e) {
        console.warn('Supabase insert failed, falling back to local test store:', e);
      }
    }

    // Local Test Fallback
    const newCase: MedicalCase = {
      id: `case-${Date.now()}`,
      case_number: getNextCaseNumber(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      patient_name,
      patient_email,
      patient_phone: patient_phone || null,
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      chief_complaint,
      symptoms_description: symptoms_description || null,
      urgency_level: urgency_level || 'routine',
      status: 'submitted',
      assigned_coordinator: null,
      coordinator_notes: null,
      documents: documents || [],
    };

    mockCases.unshift(newCase);

    mockNotifications.unshift({
      id: `notif-${Date.now()}`,
      case_id: newCase.id,
      created_at: new Date().toISOString(),
      recipient: patient_email,
      channel: 'email',
      event_type: 'case_submitted',
      subject: `Your medical intake case has been received (${newCase.case_number})`,
      message_body: `Hello ${patient_name}, your intake form has been submitted with urgency: ${newCase.urgency_level}. A care coordinator is reviewing your record.`,
      status: 'sent',
      error_message: null,
      metadata: { urgency: newCase.urgency_level, complaint: chief_complaint },
    });

    return NextResponse.json({ success: true, case: newCase, source: 'local-test-mode' }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
