import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');
    const search = searchParams.get('search');

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

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ cases: data || [] });
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

    if (error) {
      console.error('Supabase case insertion error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, case: data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
