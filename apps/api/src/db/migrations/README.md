# Migrations

This folder is populated by `drizzle-kit generate` (run `pnpm db:generate` from
the repo root, or `pnpm --filter @oreset/api db:generate`). It's empty right
now because that requires installed dependencies and hasn't been run yet —
do this as your first setup step.

## Required manual step: the write-once trigger on `submissions`

Drizzle's schema DSL has no trigger primitive, so the immutability guarantee
on `submissions.captured_at` / `device_info` / `storage_key` (the compliance
"immutable metadata" requirement) has to be added as a **custom migration**,
by hand, once — right after the first `db:generate` run produces the initial
`submissions` table.

Steps:
1. `pnpm db:generate` (produces `0000_xxxx.sql` and friends)
2. `pnpm --filter @oreset/api exec drizzle-kit generate --custom --name write_once_submissions_trigger`
3. Open the empty SQL file that creates, and paste in:

```sql
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
```

4. `pnpm db:migrate`

This is intentionally left as a manual step rather than a generated file
committed sight-unseen, since it's the one place a typo silently defeats the
compliance guarantee — worth a deliberate look before it ships.
