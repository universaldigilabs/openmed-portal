import { MedicalCase, NotificationLog } from '@/types/database';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes('your-project-id') || key.includes('your-anon-key')) return false;
  return true;
}

// In-memory persistent mock database for local offline testing
let mockCaseCounter = 1004;

export const mockCases: MedicalCase[] = [
  {
    id: 'case-demo-1',
    case_number: 'MC-1001',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    patient_name: 'Sarah Jenkins',
    patient_email: 'sarah.jenkins@example.com',
    patient_phone: '+1 (555) 234-5678',
    date_of_birth: '1988-06-14',
    gender: 'female',
    chief_complaint: 'Acute lower right quadrant abdominal pain for 18 hours with nausea',
    symptoms_description: 'Pain started near navel and migrated to RLQ. Rebound tenderness, low grade fever (100.4F). Took acetaminophen with minimal relief. Suspected appendicitis evaluation needed.',
    urgency_level: 'urgent',
    status: 'under_review',
    assigned_coordinator: 'Dr. Sarah Chen, RN',
    coordinator_notes: 'Patient contacted via triage call. Instructed to keep NPO and report to outpatient urgent care for ultrasound.',
    documents: [
      {
        name: 'prior_abdominal_ultrasound.pdf',
        path: 'cases/demo/prior_abdominal_ultrasound.pdf',
        size: 1420500,
        type: 'application/pdf',
        uploaded_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
  },
  {
    id: 'case-demo-2',
    case_number: 'MC-1002',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    patient_name: 'Robert Chang',
    patient_email: 'robert.chang@example.com',
    patient_phone: '+1 (555) 987-6543',
    date_of_birth: '1964-11-20',
    gender: 'male',
    chief_complaint: 'Substernal chest tightness with mild shortness of breath upon exertion',
    symptoms_description: 'Symptoms onset 45 minutes ago while climbing stairs. History of hypertension and hyperlipidemia. Discomfort radiates into left jaw.',
    urgency_level: 'emergency',
    status: 'action_required',
    assigned_coordinator: 'Emergency Triage Team',
    coordinator_notes: 'FLAGGED CRITICAL: Patient advised via urgent notification to dial 911 immediately.',
    documents: [
      {
        name: 'recent_ecg_report.pdf',
        path: 'cases/demo/recent_ecg_report.pdf',
        size: 890200,
        type: 'application/pdf',
        uploaded_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ],
  },
  {
    id: 'case-demo-3',
    case_number: 'MC-1003',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    patient_name: 'Emily Rodriguez',
    patient_email: 'emily.rodriguez@example.com',
    patient_phone: '+1 (555) 432-1098',
    date_of_birth: '1995-03-22',
    gender: 'female',
    chief_complaint: 'Seasonal allergic rhinitis and mild wheezing medication renewal',
    symptoms_description: 'Annual prescription renewal for Albuterol HFA and Fluticasone spray. No acute respiratory distress.',
    urgency_level: 'routine',
    status: 'resolved',
    assigned_coordinator: 'Nurse Miller',
    coordinator_notes: 'Refill approved and submitted to patient preferred pharmacy.',
    documents: [],
  },
];

export const mockNotifications: NotificationLog[] = [
  {
    id: 'notif-1',
    case_id: 'case-demo-1',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    recipient: 'sarah.jenkins@example.com',
    channel: 'email',
    event_type: 'case_submitted',
    subject: 'Your medical intake case has been received (MC-1001)',
    message_body: 'Hello Sarah Jenkins, your intake form has been submitted with urgency: urgent. A care coordinator is reviewing your record.',
    status: 'sent',
    error_message: null,
    metadata: { urgency: 'urgent' },
  },
  {
    id: 'notif-2',
    case_id: 'case-demo-1',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    recipient: 'sarah.jenkins@example.com',
    channel: 'email',
    event_type: 'status_changed',
    subject: 'Medical Case Update: Status changed to under_review',
    message_body: 'Hello Sarah Jenkins, your case (MC-1001) status has been updated to under_review by Dr. Sarah Chen, RN.',
    status: 'sent',
    error_message: null,
    metadata: { previous_status: 'submitted', new_status: 'under_review' },
  },
  {
    id: 'notif-3',
    case_id: 'case-demo-2',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    recipient: 'robert.chang@example.com',
    channel: 'email',
    event_type: 'case_submitted',
    subject: 'EMERGENCY TRIAGE NOTICE: Case MC-1002 received',
    message_body: 'Immediate warning: Your symptoms indicate an emergency. Emergency coordinators are alerted.',
    status: 'sent',
    error_message: null,
    metadata: { urgency: 'emergency' },
  },
];

export function getNextCaseNumber(): string {
  const num = mockCaseCounter++;
  return `MC-${num}`;
}
