import { DestinationCountry, MedicalSpecialty } from './medical-tourism';

export type UrgencyLevel = 'routine' | 'urgent' | 'critical' | 'emergency';

export type CaseStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'quote_prepared'
  | 'visa_processing'
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

export interface TravelPreferences {
  destination_country?: DestinationCountry;
  procedure_specialty?: MedicalSpecialty;
  specific_procedure?: string;
  target_timeline?: string;
  patient_nationality?: string;

  // Accommodation Assistance
  need_hotel_booking?: boolean;
  accommodation_type?: 'serviced_apartment' | 'partner_hotel_4star' | 'budget_guesthouse' | 'recovery_suite' | string;
  companion_count?: number | string;

  // Visa Assistance
  need_visa_assistance?: boolean;
  visa_attendants_count?: number | string;

  // Health Insurance Assistance
  need_insurance_assistance?: boolean;
  insurance_type?: 'has_international_insurance' | 'need_travel_complication_insurance' | 'self_pay_tpa_reimbursement' | string;
  insurance_provider?: string;

  // Other Concierge Services
  need_airport_transfer?: boolean;
  need_translator?: boolean;
  need_second_opinion?: boolean;
  budget_currency?: string;
  budget_amount?: string;
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
  
  // Medical Tourism Fields
  destination_country?: DestinationCountry | string | null;
  procedure_specialty?: MedicalSpecialty | string | null;
  travel_preferences?: TravelPreferences | null;
  quoted_hospital?: string | null;
  estimated_cost_usd?: number | null;
}

export interface NotificationLog {
  id: string;
  created_at: string;
  case_id: string;
  recipient: string;
  channel: 'email' | 'sms' | 'webhook' | 'system';
  event_type: 'case_submitted' | 'status_changed' | 'note_added' | 'coordinator_assigned' | 'document_uploaded' | 'quote_prepared' | 'visa_issued';
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
  
  // Medical Tourism Additions
  procedure_specialty: MedicalSpecialty | string;
  destination_country: DestinationCountry | string;
  target_timeline: string;
  patient_nationality: string;

  // Accommodation Assistance
  need_hotel_booking: boolean;
  accommodation_type: string;
  companion_count: string;

  // Visa Assistance
  need_visa_assistance: boolean;
  visa_attendants_count: string;

  // Health Insurance Assistance
  need_insurance_assistance: boolean;
  insurance_type: string;
  insurance_provider: string;

  // Other Services
  need_airport_transfer: boolean;
  need_translator: boolean;
  need_second_opinion: boolean;
}
