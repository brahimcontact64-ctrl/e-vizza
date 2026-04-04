export type UserRole = 'user' | 'admin' | 'super_admin';

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  nationality?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Visa {
  id: string;
  country_name: string;
  country_code: string;
  visa_type: string;
  visa_category?: 'e_visa' | 'visa_required' | 'visa_free';
  validity: string;
  stay_duration: string;
  entries: string;
  processing_time: string;
  requirements: string[];
  government_fee: number;
  service_fee: number;
  total_price: number;
  price_eur?: number;
  price_dzd?: number;
  is_active: boolean;
  is_popular: boolean;
  image_url?: string;
  description?: string;
  created_at: string;
  last_updated: string;
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'sent_to_freelancer'
  | 'bundle_generated'
  | 'sent'
  | 'approved'
  | 'rejected';

export interface Application {
  id: string;
  user_id: string;
  visa_id: string;
  status: ApplicationStatus;
  admin_notes?: string;
  planned_entry_date?: string;
  planned_exit_date?: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  visa?: Visa;
}

export interface Document {
  id: string;
  application_id?: string;
  appointment_id?: string;
  user_id?: string;
  type?: string;
  document_type?: string;
  file_url?: string;
  file_path?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  content_type?: string;
  source_type?: 'camera' | 'upload';
  quality_status?: 'approved' | 'rejected';
  is_passport_verified?: boolean;
  verification_confidence?: number;
  verification_details?: {
    detectedKeywords?: string[];
    timestamp?: string;
    method?: string;
  };
  verification_error?: string;
  verified_at?: string;
  created_at: string;
}

export interface SendLog {
  id: string;
  application_id: string;
  sent_to: string;
  sent_via: 'email' | 'whatsapp';
  message?: string;
  sent_at: string;
  sent_by?: string;
}

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  status: ApplicationStatus;
  note?: string;
  created_at: string;
  updated_by?: string;
}

export type VisaAppointmentCountry = 'China' | 'Portugal' | 'Turkey' | 'France' | 'Saudi Arabia';

export type VisaAppointmentType = 'Tourism' | 'Business' | 'Study' | 'Work' | 'Medical' | 'Transit' | 'Family Visit';

export type VisaAppointmentStatus = 'priority_request' | 'waiting_list' | 'processing' | 'booked' | 'rejected' | 'cancelled';

export interface VisaAppointment {
  id: string;
  user_id: string;
  country: VisaAppointmentCountry;
  visa_type: VisaAppointmentType;
  passport_file: string;
  status: VisaAppointmentStatus;
  appointment_month: string;
  queue_position?: number;
  month?: number;
  year?: number;
  registration_date?: string;
  appointment_status?: AppointmentStatus;
  assigned_to?: string;
  assigned_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VisaDocumentReview {
  id: string;
  appointment_id: string;
  user_id: string;
  document_type: string;
  file_path: string;
  created_at: string;
}

export interface VisaFileAnalysis {
  id: string;
  appointment_id: string;
  user_id: string;
  readiness_score: number;
  suggestions: string[];
  document_checklist: Record<string, boolean>;
  created_at: string;
}

export interface SlotAvailability {
  total_bookings: number;
  available_slots: number;
  next_position: number;
  status: 'confirmed' | 'waiting' | 'full';
  can_book: boolean;
}

export type AppointmentStatus = 'requested' | 'assigned' | 'processing' | 'appointment_booked' | 'completed' | 'cancelled';

export interface Freelancer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  country?: string;
  specialization: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppointmentTimeline {
  id: string;
  appointment_id: string;
  status: string;
  note?: string;
  created_at: string;
  created_by?: string;
}

export interface VisaAppointmentWithDetails extends VisaAppointment {
  appointment_status: AppointmentStatus;
  assigned_to?: string;
  assigned_at?: string;
  freelancer?: Freelancer;
  timeline?: AppointmentTimeline[];
}
