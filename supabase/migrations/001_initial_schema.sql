-- ============================================================
-- CUPPA — Initial Schema Migration
-- Run in your Supabase project SQL Editor
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE job_type AS ENUM ('TEMP', 'PERM');
CREATE TYPE vetting_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE business_type AS ENUM ('CAFE', 'RESTAURANT', 'HOTEL', 'EVENT', 'OTHER');
CREATE TYPE shift_status AS ENUM ('DRAFT', 'OPEN', 'FILLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE application_status AS ENUM ('PENDING', 'OFFERED', 'ACCEPTED', 'REJECTED', 'DECLINED', 'WITHDRAWN');
CREATE TYPE payment_method AS ENUM ('STRIPE', 'MANUAL');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE');
CREATE TYPE reviewer_type AS ENUM ('BUSINESS', 'WORKER');
CREATE TYPE message_sender AS ENUM ('WORKER', 'BUSINESS', 'SYSTEM');

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL UNIQUE,
  name                  TEXT NOT NULL,
  avatar_url            TEXT,
  phone                 TEXT,
  has_worker_profile    BOOLEAN NOT NULL DEFAULT FALSE,
  has_business_profile  BOOLEAN NOT NULL DEFAULT FALSE,
  active_role           TEXT NOT NULL DEFAULT 'WORKER' CHECK (active_role IN ('WORKER', 'BUSINESS', 'ADMIN')),
  is_admin              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create user row on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- WORKER PROFILES
-- ============================================================

CREATE TABLE worker_profiles (
  user_id               UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio                   TEXT,
  years_experience      INTEGER NOT NULL DEFAULT 0,
  skills                TEXT[] NOT NULL DEFAULT '{}',
  certifications        TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate_min       NUMERIC(8,2) NOT NULL DEFAULT 35.00,
  suburb                TEXT,
  state                 TEXT,
  lat                   NUMERIC(9,6),
  lng                   NUMERIC(9,6),
  vetting_status        vetting_status NOT NULL DEFAULT 'PENDING',
  stripe_account_id     TEXT,
  avg_rating            NUMERIC(3,2),
  total_shifts_completed INTEGER NOT NULL DEFAULT 0,
  completion_rate       NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  karma                 INTEGER NOT NULL DEFAULT 0,
  fee_override_until    DATE,
  available_from        DATE,
  available_to          DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BUSINESS PROFILES
-- ============================================================

CREATE TABLE business_profiles (
  user_id               UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name         TEXT NOT NULL,
  abn                   TEXT,
  address               TEXT NOT NULL DEFAULT '',
  suburb                TEXT NOT NULL DEFAULT '',
  state                 TEXT NOT NULL DEFAULT 'VIC',
  postcode              TEXT NOT NULL DEFAULT '',
  lat                   NUMERIC(9,6),
  lng                   NUMERIC(9,6),
  type                  business_type NOT NULL DEFAULT 'CAFE',
  logo_url              TEXT,
  stripe_customer_id    TEXT,
  preferred_payment     payment_method NOT NULL DEFAULT 'STRIPE',
  bank_account_name     TEXT,
  bank_bsb              TEXT,
  bank_account_number   TEXT,
  verified              BOOLEAN NOT NULL DEFAULT FALSE,
  avg_rating            NUMERIC(3,2),
  total_jobs_posted     INTEGER NOT NULL DEFAULT 0,
  karma                 INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SHIFTS
-- ============================================================

CREATE TABLE shifts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id           UUID NOT NULL REFERENCES users(id),
  job_type              job_type NOT NULL DEFAULT 'TEMP',
  title                 TEXT NOT NULL,
  description           TEXT,
  equipment             TEXT,
  address               TEXT NOT NULL,
  suburb                TEXT NOT NULL,
  state                 TEXT NOT NULL DEFAULT 'VIC',
  postcode              TEXT,
  lat                   NUMERIC(9,6),
  lng                   NUMERIC(9,6),
  start_time            TIMESTAMPTZ NOT NULL,
  end_time              TIMESTAMPTZ NOT NULL,
  group_id              UUID,
  hourly_rate           NUMERIC(8,2) NOT NULL,
  required_skills       TEXT[] NOT NULL DEFAULT '{}',
  min_experience_years  INTEGER NOT NULL DEFAULT 0,
  dress_code            TEXT,
  notes                 TEXT,
  weekly_hours          INTEGER,
  salary_min            NUMERIC(10,2),
  salary_max            NUMERIC(10,2),
  status                shift_status NOT NULL DEFAULT 'DRAFT',
  filled_by_worker_id   UUID REFERENCES users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPLICATIONS
-- ============================================================

CREATE TABLE applications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id      UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  worker_id     UUID NOT NULL REFERENCES users(id),
  status        application_status NOT NULL DEFAULT 'PENDING',
  message       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shift_id, worker_id)
);

-- ============================================================
-- SHIFT MESSAGES (chat thread per application)
-- ============================================================

CREATE TABLE shift_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id        UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  sender_type     message_sender NOT NULL,
  sender_id       UUID REFERENCES users(id),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TIME RECORDS
-- ============================================================

CREATE TABLE time_records (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id              UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  worker_id             UUID NOT NULL REFERENCES users(id),
  clock_in              TIMESTAMPTZ,
  clock_out             TIMESTAMPTZ,
  clock_in_lat          NUMERIC(9,6),
  clock_in_lng          NUMERIC(9,6),
  confirmed_by_business BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_at          TIMESTAMPTZ,
  total_hours           NUMERIC(5,2),
  dispute_note          TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================

CREATE TABLE transactions (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id                  UUID NOT NULL REFERENCES shifts(id),
  business_id               UUID NOT NULL REFERENCES users(id),
  worker_id                 UUID NOT NULL REFERENCES users(id),
  total_hours               NUMERIC(5,2) NOT NULL,
  hourly_rate               NUMERIC(8,2) NOT NULL,
  gross_amount              NUMERIC(10,2) NOT NULL,
  platform_fee_pct          NUMERIC(5,2) NOT NULL DEFAULT 7.00,
  platform_fee_amount       NUMERIC(10,2) NOT NULL,
  worker_payout             NUMERIC(10,2) NOT NULL,
  business_total            NUMERIC(10,2) NOT NULL,
  payment_method            payment_method NOT NULL,
  status                    transaction_status NOT NULL DEFAULT 'PENDING',
  stripe_payment_intent_id  TEXT,
  stripe_transfer_id        TEXT,
  payout_date               TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INVOICES
-- ============================================================

CREATE SEQUENCE invoice_number_seq START 1000;

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id),
  invoice_number  TEXT NOT NULL UNIQUE,
  business_id     UUID NOT NULL REFERENCES users(id),
  worker_id       UUID NOT NULL REFERENCES users(id),
  issued_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE NOT NULL,
  total_amount    NUMERIC(10,2) NOT NULL,
  pdf_url         TEXT,
  status          invoice_status NOT NULL DEFAULT 'DRAFT',
  sent_at         TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('invoice_number_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE reviews (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id          UUID NOT NULL REFERENCES shifts(id),
  reviewer_id       UUID NOT NULL REFERENCES users(id),
  reviewee_id       UUID NOT NULL REFERENCES users(id),
  reviewer_type     reviewer_type NOT NULL,
  rating            INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment           TEXT,
  created_by_admin  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shift_id, reviewer_id)
);

-- ============================================================
-- NOTIFICATIONS & PUSH TOKENS
-- ============================================================

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  data_json   JSONB,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE push_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  platform    TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_shifts_status       ON shifts(status);
CREATE INDEX idx_shifts_start_time   ON shifts(start_time);
CREATE INDEX idx_shifts_business_id  ON shifts(business_id);
CREATE INDEX idx_shifts_job_type     ON shifts(job_type);
CREATE INDEX idx_shifts_group_id     ON shifts(group_id);
CREATE INDEX idx_applications_shift  ON applications(shift_id);
CREATE INDEX idx_applications_worker ON applications(worker_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_messages_application ON shift_messages(application_id);
CREATE INDEX idx_notifications_user  ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_reviews_reviewee    ON reviews(reviewee_id);
