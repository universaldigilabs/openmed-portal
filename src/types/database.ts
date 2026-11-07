export type UrgencyLevel = 'routine' | 'urgent' | 'critical' | 'emergency';

export type CaseStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'action_required' 
  | 'scheduled' 
  | 'resolved' 
  | 'closed';

export type Gender = 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say';

export interface DocumentAttachment {
  name: string;
  path: string;
  size: number;
  type: string;
  uploaded_at: string;
}

export interface MedicalCase {
  id: string;
  case_number: string;
  created_at: string;
  updated_at: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  chief_complaint: string;
  symptoms_description: string | null;
  urgency_level: UrgencyLevel;
  status: CaseStatus;
  assigned_coordinator: string | null;
  coordinator_notes: string | null;
  documents: DocumentAttachment[];
}

export interface NotificationLog {
  id: string;
  created_at: string;
  case_id: string;
  recipient: string;
  channel: 'email' | 'sms' | 'webhook' | 'system';
  event_type: 'case_submitted' | 'status_changed' | 'note_added' | 'coordinator_assigned' | 'document_uploaded';
  subject: string | null;
  message_body: string;
  status: 'pending' | 'sent' | 'failed';
  error_message: string | null;
  metadata: Record<string, unknown>;
}

export interface IntakeFormData {
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  date_of_birth: string;
  gender: Gender;
  chief_complaint: string;
  symptoms_description: string;
  urgency_level: UrgencyLevel;
}
