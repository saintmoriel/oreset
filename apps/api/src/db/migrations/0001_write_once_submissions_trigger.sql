CREATE OR REPLACE FUNCTION prevent_submission_immutable_field_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.captured_at IS DISTINCT FROM OLD.captured_at
     OR NEW.device_info IS DISTINCT FROM OLD.device_info
     OR NEW.storage_key IS DISTINCT FROM OLD.storage_key THEN
    RAISE EXCEPTION 'submissions.captured_at, device_info, and storage_key are immutable once written';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submissions_write_once
BEFORE UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION prevent_submission_immutable_field_update();
