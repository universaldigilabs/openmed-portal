import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isSupabaseConfigured, mockCases, mockNotifications, getNextCaseNumber } from '@/lib/mock-store';
import { MedicalCase } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');
    const country = searchParams.get('country');
    const specialty = searchParams.get('specialty');
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
        if (!error && data && data.length > 0) {
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

    if (country && country !== 'all') {
      filtered = filtered.filter((c) => c.destination_country === country);
    }

    if (specialty && specialty !== 'all') {
      filtered = filtered.filter((c) => c.procedure_specialty === specialty);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.patient_name.toLowerCase().includes(q) ||
          c.patient_email.toLowerCase().includes(q) ||
          c.case_number.toLowerCase().includes(q) ||
          c.chief_complaint.toLowerCase().includes(q) ||
          (c.destination_country && c.destination_country.toLowerCase().includes(q)) ||
          (c.procedure_specialty && c.procedure_specialty.toLowerCase().includes(q))
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
      procedure_specialty,
      destination_country,
      target_timeline,
      patient_nationality,
      need_visa_assistance,
      need_airport_transfer,
      need_hotel_booking,
      need_translator,
      need_second_opinion,
    } = body;

    if (!patient_name || !patient_email || !chief_complaint) {
      return NextResponse.json(
        { error: 'Patient name, email, and medical details are required fields.' },
        { status: 400 }
      );
    }

    const travel_preferences = {
      destination_country: destination_country || 'Any Destination',
      procedure_specialty: procedure_specialty || 'General Inquiry',
      target_timeline: target_timeline || 'Flexible',
      patient_nationality: patient_nationality || 'Not specified',
      need_visa_assistance: Boolean(need_visa_assistance),
      need_airport_transfer: Boolean(need_airport_transfer),
      need_hotel_booking: Boolean(need_hotel_booking),
      need_translator: Boolean(need_translator),
      need_second_opinion: Boolean(need_second_opinion),
    };

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
          return NextResponse.json(
            {
              success: true,
              case: {
                ...data,
                destination_country: destination_country || 'India',
                procedure_specialty: procedure_specialty || 'General',
                travel_preferences,
              },
              source: 'supabase',
            },
            { status: 201 }
          );
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
      destination_country: destination_country || 'India',
      procedure_specialty: procedure_specialty || 'General',
      travel_preferences,
      quoted_hospital: null,
      estimated_cost_usd: null,
    };

    mockCases.unshift(newCase);

    mockNotifications.unshift({
      id: `notif-${Date.now()}`,
      case_id: newCase.id,
      created_at: new Date().toISOString(),
      recipient: patient_email,
      channel: 'email',
      event_type: 'case_submitted',
      subject: `Med Vantage: Medical Tourism Case Received (${newCase.case_number})`,
      message_body: `Hello ${patient_name}, your inquiry for ${procedure_specialty || 'treatment'} in ${destination_country || 'abroad'} has been registered. An accredited hospital coordinator is reviewing your record.`,
      status: 'sent',
      error_message: null,
      metadata: { procedure: procedure_specialty, destination: destination_country },
    });

    return NextResponse.json({ success: true, case: newCase, source: 'local-test-mode' }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
