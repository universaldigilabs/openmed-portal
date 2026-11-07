import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: medicalCase, error: caseError } = await supabaseAdmin
      .from('medical_cases')
      .select('*')
      .eq('id', id)
      .single();

    if (caseError) {
      return NextResponse.json({ error: caseError.message }, { status: 404 });
    }

    // Fetch associated notification audit trail
    const { data: notifications, error: notifError } = await supabaseAdmin
      .from('notification_log')
      .select('*')
      .eq('case_id', id)
      .order('created_at', { ascending: false });

    if (notifError) {
      console.warn('Error fetching notifications:', notifError);
    }

    return NextResponse.json({
      case: medicalCase,
      notifications: notifications || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      status,
      urgency_level,
      assigned_coordinator,
      coordinator_notes,
    } = body;

    // Fetch existing state first for audit diffing
    const { data: existingCase, error: fetchErr } = await supabaseAdmin
      .from('medical_cases')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (status !== undefined) updates.status = status;
    if (urgency_level !== undefined) updates.urgency_level = urgency_level;
    if (assigned_coordinator !== undefined) updates.assigned_coordinator = assigned_coordinator;
    if (coordinator_notes !== undefined) updates.coordinator_notes = coordinator_notes;

    const { data: updatedCase, error: updateErr } = await supabaseAdmin
      .from('medical_cases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Audit notification if status changed
    if (status && status !== existingCase.status) {
      await supabaseAdmin.from('notification_log').insert([
        {
          case_id: id,
          recipient: existingCase.patient_email,
          channel: 'email',
          event_type: 'status_changed',
          subject: `Medical Case Update: Status changed to ${status}`,
          message_body: `Hello ${existingCase.patient_name}, the status of your case (${existingCase.case_number}) has been updated from '${existingCase.status}' to '${status}'.`,
          status: 'sent',
          metadata: { previous_status: existingCase.status, new_status: status },
        },
      ]);
    }

    return NextResponse.json({ success: true, case: updatedCase });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
