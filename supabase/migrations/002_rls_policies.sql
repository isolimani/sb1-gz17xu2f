-- ============================================================
-- CUPPA — Row Level Security Policies
-- ============================================================

-- USERS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_record" ON users
  FOR ALL USING (id = auth.uid());
CREATE POLICY "users_public_read" ON users
  FOR SELECT USING (true);

-- WORKER PROFILES
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "worker_own_profile" ON worker_profiles
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "worker_approved_public_read" ON worker_profiles
  FOR SELECT USING (vetting_status = 'APPROVED');

-- BUSINESS PROFILES
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "business_own_profile" ON business_profiles
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "business_public_read" ON business_profiles
  FOR SELECT USING (true);

-- SHIFTS
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "business_manages_own_shifts" ON shifts
  FOR ALL USING (business_id = auth.uid());
CREATE POLICY "workers_see_open_shifts" ON shifts
  FOR SELECT USING (status = 'OPEN');

-- APPLICATIONS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "worker_own_applications" ON applications
  FOR ALL USING (worker_id = auth.uid());
CREATE POLICY "business_sees_applications_for_own_shifts" ON applications
  FOR SELECT USING (
    shift_id IN (SELECT id FROM shifts WHERE business_id = auth.uid())
  );
CREATE POLICY "business_updates_applications" ON applications
  FOR UPDATE USING (
    shift_id IN (SELECT id FROM shifts WHERE business_id = auth.uid())
  );

-- SHIFT MESSAGES
ALTER TABLE shift_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants_see_messages" ON shift_messages
  FOR SELECT USING (
    sender_id = auth.uid()
    OR application_id IN (SELECT id FROM applications WHERE worker_id = auth.uid())
    OR shift_id IN (SELECT id FROM shifts WHERE business_id = auth.uid())
  );
CREATE POLICY "participants_insert_messages" ON shift_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    OR sender_type = 'SYSTEM'
  );

-- TIME RECORDS
ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "worker_own_time_records" ON time_records
  FOR ALL USING (worker_id = auth.uid());
CREATE POLICY "business_sees_shift_time_records" ON time_records
  FOR SELECT USING (
    shift_id IN (SELECT id FROM shifts WHERE business_id = auth.uid())
  );
CREATE POLICY "business_confirms_time_records" ON time_records
  FOR UPDATE USING (
    shift_id IN (SELECT id FROM shifts WHERE business_id = auth.uid())
  );

-- TRANSACTIONS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "business_own_transactions" ON transactions
  FOR SELECT USING (business_id = auth.uid());
CREATE POLICY "worker_own_transactions" ON transactions
  FOR SELECT USING (worker_id = auth.uid());

-- INVOICES
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "business_own_invoices" ON invoices
  FOR SELECT USING (business_id = auth.uid());
CREATE POLICY "worker_own_invoices" ON invoices
  FOR SELECT USING (worker_id = auth.uid());

-- REVIEWS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (true);
CREATE POLICY "reviewer_own_reviews" ON reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid() OR created_by_admin = true);

-- NOTIFICATIONS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- PUSH TOKENS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_push_tokens" ON push_tokens
  FOR ALL USING (user_id = auth.uid());
