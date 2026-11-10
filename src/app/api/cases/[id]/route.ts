import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isSupabaseConfigured, mockCases, mockNotifications } from '@/lib/mock-store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (isSupabaseConfigured()) {
      try {
        const { data: medicalCase, error: caseError } = await supabaseAdmin
          .from('medical_cases')
          .select('*')
          .eq('id', id)
          .single();

        if (!caseError && medicalCase) {
          const { data: notifications } = await supabaseAdmin
            .from('notification_log')
            .select('*')
            .eq('case_id', id)
            .order('created_at', { ascending: false });

          return NextResponse.json({
            case: medicalCase,
            notifications: notifications || [],
            source: 'supabase',
          });
        }
      } catch (e) {
        console.warn('Falling back to local mock store for case details:', e);
      }
    }

    const found = mockCases.find((c) => c.id === id);
    if (!found) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const notifs = mockNotifications.filter((n) => n.case_id === id);
    return NextResponse.json({
      case: found,
      notifications: notifs,
      source: 'local-test-mode',
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
      quoted_hospital,
      estimated_cost_usd,
    } = body;

    if (isSupabaseConfigured()) {
      try {
        const { data: existingCase } = await supabaseAdmin
          .from('medical_cases')
          .select('*')
          .eq('id', id)
          .single();

        if (existingCase) {
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

          if (!updateErr && updatedCase) {
            if (status && status !== existingCase.status) {
              await supabaseAdmin.from('notification_log').insert([
                {
                  case_id: id,
                  recipient: existingCase.patient_email,
                  channel: 'email',
                  event_type: 'status_changed',
                  subject: `Med Vantage Update: Status changed to ${status}`,
                  message_body: `Hello ${existingCase.patient_name}, the status of your medical tourism inquiry (${existingCase.case_number}) has been updated to '${status}'.`,
                  status: 'sent',
                  metadata: { previous_status: existingCase.status, new_status: status },
                },
              ]);
            }
            return NextResponse.json({
              success: true,
              case: {
                ...updatedCase,
                quoted_hospital,
                estimated_cost_usd,
              },
              source: 'supabase',
            });
          }
        }
      } catch (e) {
        console.warn('Falling back to local mock store for PATCH:', e);
      }
    }

    // Local Test Fallback
    const existingIndex = mockCases.findIndex((c) => c.id === id);
    if (existingIndex === -1) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const prev = mockCases[existingIndex];
    const prevStatus = prev.status;

    if (status !== undefined) prev.status = status;
    if (urgency_level !== undefined) prev.urgency_level = urgency_level;
    if (assigned_coordinator !== undefined) prev.assigned_coordinator = assigned_coordinator;
    if (coordinator_notes !== undefined) prev.coordinator_notes = coordinator_notes;
    if (quoted_hospital !== undefined) prev.quoted_hospital = quoted_hospital;
    if (estimated_cost_usd !== undefined) prev.estimated_cost_usd = estimated_cost_usd;
    prev.updated_at = new Date().toISOString();

    if (status && status !== prevStatus) {
      mockNotifications.unshift({
        id: `notif-${Date.now()}`,
        case_id: id,
        created_at: new Date().toISOString(),
        recipient: prev.patient_email,
        channel: 'email',
        event_type: 'status_changed',
        subject: `Med Vantage Update: Status changed to ${status}`,
        message_body: `Hello ${prev.patient_name}, your medical tourism case (${prev.case_number}) has been updated from '${prevStatus}' to '${status}'.`,
        status: 'sent',
        error_message: null,
        metadata: { previous_status: prevStatus, new_status: status },
      });
    }

    return NextResponse.json({ success: true, case: prev, source: 'local-test-mode' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
