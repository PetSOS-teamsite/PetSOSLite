DO $$
DECLARE
  fk_name text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pets'
      AND column_name = 'last_visit_clinic_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pets'
      AND column_name = 'last_visit_hospital_id'
  ) THEN
    FOR fk_name IN
      SELECT c.conname
      FROM pg_constraint c
      JOIN pg_attribute a
        ON a.attrelid = c.conrelid
       AND a.attnum = ANY(c.conkey)
      WHERE c.conrelid = 'public.pets'::regclass
        AND c.contype = 'f'
        AND a.attname = 'last_visit_clinic_id'
    LOOP
      EXECUTE format('ALTER TABLE public.pets DROP CONSTRAINT %I', fk_name);
    END LOOP;

    ALTER TABLE public.pets RENAME COLUMN last_visit_clinic_id TO last_visit_hospital_id;
  END IF;

  FOR fk_name IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_attribute a
      ON a.attrelid = c.conrelid
     AND a.attnum = ANY(c.conkey)
    WHERE c.conrelid = 'public.pets'::regclass
      AND c.contype = 'f'
      AND a.attname = 'last_visit_hospital_id'
  LOOP
    EXECUTE format('ALTER TABLE public.pets DROP CONSTRAINT %I', fk_name);
  END LOOP;

  UPDATE public.pets p
  SET last_visit_hospital_id = NULL
  WHERE p.last_visit_hospital_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.clinics c
      WHERE c.id = p.last_visit_hospital_id
    );

  ALTER TABLE public.pets
    ADD CONSTRAINT pets_last_visit_hospital_id_clinics_id_fk
    FOREIGN KEY (last_visit_hospital_id)
    REFERENCES public.clinics(id)
    ON DELETE SET NULL;
END $$;
