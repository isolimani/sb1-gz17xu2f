// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "WORKER" | "BUSINESS" | "ADMIN";

export type VettingStatus = "PENDING" | "APPROVED" | "REJECTED";

export type BusinessType = "CAFE" | "RESTAURANT" | "HOTEL" | "EVENT" | "OTHER";

export type JobType = "TEMP" | "PERM";

export type ShiftStatus =
  | "DRAFT"
  | "OPEN"
  | "FILLED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type ApplicationStatus =
  | "PENDING"  // barista applied, awaiting business response
  | "OFFERED"  // business offered the job, awaiting barista accept/decline
  | "ACCEPTED" // barista accepted the offer — shift is filled
  | "REJECTED" // business rejected applicant
  | "DECLINED" // barista declined business offer
  | "WITHDRAWN"; // barista withdrew their own application

export type PaymentMethod = "STRIPE" | "MANUAL";

export type TransactionStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE";

export type ReviewerType = "BUSINESS" | "WORKER";

export type MessageSender = "WORKER" | "BUSINESS" | "SYSTEM";

// ─── Core entities ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  phone?: string;
  has_worker_profile: boolean;
  has_business_profile: boolean;
  active_role: UserRole; // current mode the user is in
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkerProfile {
  user_id: string;
  bio?: string;
  years_experience: number;
  skills: string[];
  certifications: string[];
  hourly_rate_min: number;
  suburb?: string;
  state?: string;
  lat?: number;
  lng?: number;
  vetting_status: VettingStatus;
  stripe_account_id?: string;
  avg_rating?: number;
  total_shifts_completed: number;
  completion_rate: number; // 0–100 percentage
  karma: number; // Cuppa karma points
  fee_override_until?: string; // ISO date — promotional 0% fee until this date
  available_from?: string;
  available_to?: string;
  created_at: string;
  updated_at: string;
  // Joined
  user?: User;
}

export interface BusinessProfile {
  user_id: string;
  business_name: string;
  abn?: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  lat?: number;
  lng?: number;
  type: BusinessType;
  logo_url?: string;
  stripe_customer_id?: string;
  preferred_payment: PaymentMethod;
  bank_account_name?: string;
  bank_bsb?: string;
  bank_account_number?: string;
  verified: boolean;
  avg_rating?: number;
  total_jobs_posted: number;
  karma: number;
  created_at: string;
  updated_at: string;
  // Joined
  user?: User;
}

// ─── Shifts ───────────────────────────────────────────────────────────────────

export interface Shift {
  id: string;
  business_id: string;
  job_type: JobType;
  title: string;
  description?: string;
  equipment?: string; // e.g. "La Marzocco Linea PB, Fiorenzato F83"
  address: string;
  suburb: string;
  state: string;
  postcode?: string;
  lat?: number;
  lng?: number;
  // For TEMP: start/end per shift. For multi-shift: each is a separate shift linked by group_id
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  group_id?: string; // groups multiple shifts in one job posting
  hourly_rate: number;
  required_skills: string[];
  min_experience_years: number;
  dress_code?: string;
  notes?: string;
  // For PERM jobs
  weekly_hours?: number;
  salary_min?: number;
  salary_max?: number;
  status: ShiftStatus;
  filled_by_worker_id?: string;
  application_count?: number; // virtual
  created_at: string;
  updated_at: string;
  // Joined
  business?: BusinessProfile;
  filled_by_worker?: WorkerProfile;
  distance_km?: number; // computed server-side for feed
}

export interface Application {
  id: string;
  shift_id: string;
  worker_id: string;
  status: ApplicationStatus;
  message?: string; // cover note from barista
  created_at: string;
  updated_at: string;
  // Joined
  shift?: Shift;
  worker?: WorkerProfile;
}

// ─── Chat / Messages ──────────────────────────────────────────────────────────

export interface ShiftMessage {
  id: string;
  shift_id: string;
  application_id: string; // messages are per application thread
  sender_type: MessageSender;
  sender_id?: string; // null for SYSTEM messages
  content: string;
  created_at: string;
}

// ─── Time & Payments ──────────────────────────────────────────────────────────

export interface TimeRecord {
  id: string;
  shift_id: string;
  worker_id: string;
  clock_in?: string;
  clock_out?: string;
  clock_in_lat?: number;
  clock_in_lng?: number;
  confirmed_by_business: boolean;
  confirmed_at?: string;
  total_hours?: number;
  dispute_note?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  shift_id: string;
  business_id: string;
  worker_id: string;
  total_hours: number;
  hourly_rate: number;
  gross_amount: number; // rate × hours — what worker earns
  platform_fee_pct: number; // 7
  platform_fee_amount: number; // gross × 0.07
  worker_payout: number; // = gross_amount (worker keeps 100%)
  business_total: number; // gross + platform fee
  payment_method: PaymentMethod;
  status: TransactionStatus;
  stripe_payment_intent_id?: string;
  stripe_transfer_id?: string;
  payout_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  transaction_id: string;
  invoice_number: string; // e.g. INV-2025-001234
  business_id: string;
  worker_id: string;
  issued_date: string;
  due_date: string;
  total_amount: number; // = business_total
  pdf_url?: string;
  status: InvoiceStatus;
  sent_at?: string;
  paid_at?: string;
  created_at: string;
  // Joined
  transaction?: Transaction;
  business?: BusinessProfile;
  worker?: WorkerProfile;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  shift_id: string;
  reviewer_id: string;
  reviewee_id: string;
  reviewer_type: ReviewerType;
  rating: number; // 1–5
  comment?: string;
  created_by_admin: boolean; // true if admin manually added it
  created_at: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data_json?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

// ─── Skills ───────────────────────────────────────────────────────────────────

export const BARISTA_SKILLS = [
  "Espresso",
  "Manual pour-over",
  "Cold brew",
  "Latte art",
  "Milk texturing",
  "Rush service",
  "Batch brewing",
  "Specialty coffee",
  "Cupping / tasting",
  "Bar setup & close",
  "POS systems",
  "Food handling",
  "Bar management",
] as const;

export type BaristaSkill = (typeof BARISTA_SKILLS)[number];

export const CERTIFICATIONS = [
  "RSA (Responsible Service of Alcohol)",
  "Barista Guild certification",
  "Food handler's certificate",
  "First aid",
  "Coffee SCA certification",
] as const;

export const AU_STATES = [
  "VIC",
  "NSW",
  "QLD",
  "WA",
  "SA",
  "TAS",
  "ACT",
  "NT",
] as const;

// ─── Utility types ────────────────────────────────────────────────────────────

export interface ShiftCost {
  gross: number; // what worker earns
  platformFee: number; // 7% added on top
  businessTotal: number; // what business pays
  totalHours: number;
  hourlyRate: number;
}

export interface WorkerSnapshot {
  name: string;
  totalJobs: number;
  rating: number;
  completionRate: number;
  karma: number;
}

export interface BusinessSnapshot {
  name: string;
  totalJobs: number;
  rating: number;
  karma: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: string;
}
