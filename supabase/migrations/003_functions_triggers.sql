-- ============================================================
-- CUPPA — Functions & Triggers
-- ============================================================

-- Update worker avg_rating after each review
CREATE OR REPLACE FUNCTION update_worker_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE worker_profiles
  SET avg_rating = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM reviews
    WHERE reviewee_id = NEW.reviewee_id
      AND reviewer_type = 'BUSINESS'
  )
  WHERE user_id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_worker_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  WHEN (NEW.reviewer_type = 'BUSINESS')
  EXECUTE FUNCTION update_worker_avg_rating();

-- Update business avg_rating after each review
CREATE OR REPLACE FUNCTION update_business_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE business_profiles
  SET avg_rating = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM reviews
    WHERE reviewee_id = NEW.reviewee_id
      AND reviewer_type = 'WORKER'
  )
  WHERE user_id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_business_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  WHEN (NEW.reviewer_type = 'WORKER')
  EXECUTE FUNCTION update_business_avg_rating();

-- Increment total_shifts_completed when a shift is COMPLETED
CREATE OR REPLACE FUNCTION update_worker_shift_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' AND NEW.filled_by_worker_id IS NOT NULL THEN
    UPDATE worker_profiles
    SET total_shifts_completed = total_shifts_completed + 1,
        karma = karma + 10
    WHERE user_id = NEW.filled_by_worker_id;

    UPDATE business_profiles
    SET total_jobs_posted = total_jobs_posted + 1,
        karma = karma + 5
    WHERE user_id = NEW.business_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_shift_completed
  AFTER UPDATE ON shifts
  FOR EACH ROW
  EXECUTE FUNCTION update_worker_shift_count();

-- Decrement completion_rate when a worker cancels after accepting
CREATE OR REPLACE FUNCTION update_completion_rate()
RETURNS TRIGGER AS $$
DECLARE
  total_accepted INTEGER;
  total_completed INTEGER;
BEGIN
  IF NEW.status IN ('DECLINED', 'WITHDRAWN') AND OLD.status = 'ACCEPTED' THEN
    -- Recalculate completion rate
    SELECT
      COUNT(*) FILTER (WHERE status IN ('ACCEPTED', 'DECLINED', 'WITHDRAWN')),
      COUNT(*) FILTER (WHERE status = 'ACCEPTED')
    INTO total_accepted, total_completed
    FROM applications
    WHERE worker_id = NEW.worker_id;

    IF total_accepted > 0 THEN
      UPDATE worker_profiles
      SET completion_rate = ROUND((total_completed::numeric / total_accepted) * 100, 2),
          karma = GREATEST(0, karma - 5)
      WHERE user_id = NEW.worker_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_completion_rate
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_completion_rate();

-- Auto-insert system messages in shift chat
CREATE OR REPLACE FUNCTION insert_system_messages_on_apply()
RETURNS TRIGGER AS $$
BEGIN
  -- Tip about cover letters
  INSERT INTO shift_messages (shift_id, application_id, sender_type, content)
  VALUES (
    NEW.shift_id,
    NEW.id,
    'SYSTEM',
    'Tip: Applications with a personal message attract more attention from the manager.'
  );

  -- Cancellation policy reminder
  INSERT INTO shift_messages (shift_id, application_id, sender_type, content)
  VALUES (
    NEW.shift_id,
    NEW.id,
    'SYSTEM',
    'Reminder: To access work on Cuppa, it''s essential you understand and respect our cancellation policy. We prohibit no-shows, ghosting, and same-day cancellations without a valid reason.'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_system_messages_on_apply
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION insert_system_messages_on_apply();

-- updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_business_profiles_updated_at BEFORE UPDATE ON business_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed standard skills (for admin reference)
INSERT INTO notifications (user_id, type, title, body)
SELECT id, 'SYSTEM', 'Welcome to Cuppa!', 'Your account is set up. Complete your profile to start finding shifts.'
FROM users
WHERE FALSE; -- placeholder, real seed runs per user
