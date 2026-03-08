-- ============================================================
-- SETUP COMPLETO - NOVO PROJETO SUPABASE
-- ============================================================
-- Execute este arquivo COMPLETO no SQL Editor do Supabase.
-- Ele cria toda a estrutura do banco do zero: tabelas, RLS,
-- triggers, storage bucket e proteções de concorrência.
-- ============================================================


-- ============================================================
-- PASSO 1 - EXTENSÕES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- PASSO 2 - TIPOS (ENUMs)
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('patient', 'clinic');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('scheduled', 'cancelled', 'completed', 'confirmed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- PASSO 3 - TABELAS
-- ============================================================

-- Profiles (estende auth.users do Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  full_name   TEXT        NOT NULL,
  user_type   user_type   NOT NULL,
  phone       TEXT,
  address     TEXT,
  city        TEXT,
  state       VARCHAR(2),
  zip_code    VARCHAR(10),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN profiles.address  IS 'Endereço completo do usuário (rua, número, complemento)';
COMMENT ON COLUMN profiles.city     IS 'Cidade do usuário';
COMMENT ON COLUMN profiles.state    IS 'Estado (UF) do usuário';
COMMENT ON COLUMN profiles.zip_code IS 'CEP do usuário';

-- Clinics
CREATE TABLE IF NOT EXISTS clinics (
  id           UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id   UUID  NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clinic_name  TEXT  NOT NULL,
  address      TEXT,
  description  TEXT,
  phone        TEXT,
  email        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- Professionals
CREATE TABLE IF NOT EXISTS professionals (
  id                            UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id                     UUID     NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name                          TEXT     NOT NULL,
  specialty                     TEXT     NOT NULL,
  average_appointment_duration  INTEGER  NOT NULL DEFAULT 30,
  created_at                    TIMESTAMPTZ DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ DEFAULT NOW()
);

-- Professional availability (grade de horários semanal)
CREATE TABLE IF NOT EXISTS professional_availability (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id  UUID        NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week      day_of_week NOT NULL,
  start_time       TIME        NOT NULL,
  end_time         TIME        NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Blocked times (bloqueios pontuais ou recorrentes)
CREATE TABLE IF NOT EXISTS blocked_times (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id  UUID        NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  date             DATE,
  start_time       TIME        NOT NULL,
  end_time         TIME        NOT NULL,
  reason           TEXT,
  is_recurring     BOOLEAN     DEFAULT FALSE,
  day_of_week      day_of_week,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_blocked_time_range     CHECK (end_time > start_time),
  CONSTRAINT check_recurring_or_specific  CHECK (
    (is_recurring = TRUE  AND day_of_week IS NOT NULL AND date IS NULL) OR
    (is_recurring = FALSE AND date IS NOT NULL AND day_of_week IS NULL)
  )
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id               UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id       UUID               NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id  UUID               NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  appointment_date DATE               NOT NULL,
  start_time       TIME               NOT NULL,
  end_time         TIME               NOT NULL,
  status           appointment_status NOT NULL DEFAULT 'scheduled',
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_appointment_time_range CHECK (end_time > start_time)
);

-- Messages (com suporte a anexos)
CREATE TABLE IF NOT EXISTS messages (
  id              UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id  UUID  NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  sender_id       UUID  NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message         TEXT  NOT NULL,
  message_type    TEXT  DEFAULT 'text' CHECK (message_type IN ('text', 'file')),
  file_url        TEXT,
  file_name       TEXT,
  file_type       TEXT,
  file_size       INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- PASSO 4 - ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_type                    ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_clinics_profile_id                    ON clinics(profile_id);
CREATE INDEX IF NOT EXISTS idx_professionals_clinic_id               ON professionals(clinic_id);
CREATE INDEX IF NOT EXISTS idx_professional_availability_prof_id     ON professional_availability(professional_id);
CREATE INDEX IF NOT EXISTS idx_blocked_times_professional_id         ON blocked_times(professional_id);
CREATE INDEX IF NOT EXISTS idx_blocked_times_date                    ON blocked_times(date);
CREATE INDEX IF NOT EXISTS idx_blocked_times_recurring               ON blocked_times(professional_id, is_recurring, day_of_week);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id               ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id          ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date                     ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status                   ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_date_time   ON appointments(professional_id, appointment_date, start_time, end_time) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_messages_appointment_id               ON messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at                   ON messages(created_at DESC);

-- Índices únicos (proteção de concorrência)
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_no_overlap
  ON appointments(professional_id, appointment_date, start_time)
  WHERE status = 'scheduled';

CREATE UNIQUE INDEX IF NOT EXISTS idx_professional_availability_unique
  ON professional_availability(professional_id, day_of_week, start_time, end_time);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_times_specific_unique
  ON blocked_times(professional_id, date, start_time, end_time)
  WHERE is_recurring = FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_times_recurring_unique
  ON blocked_times(professional_id, day_of_week, start_time, end_time)
  WHERE is_recurring = TRUE;


-- ============================================================
-- PASSO 5 - ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times            ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages                 ENABLE ROW LEVEL SECURITY;

-- ---- Profiles ----
DROP POLICY IF EXISTS "Allow authenticated users to view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"                   ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users"          ON profiles;

CREATE POLICY "Allow authenticated users to view all profiles"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- ---- Clinics ----
DROP POLICY IF EXISTS "Anyone can view clinics"          ON clinics;
DROP POLICY IF EXISTS "Clinic owners can update clinic"  ON clinics;
DROP POLICY IF EXISTS "Clinic owners can insert clinic"  ON clinics;

CREATE POLICY "Anyone can view clinics"
  ON clinics FOR SELECT USING (true);

CREATE POLICY "Clinic owners can update clinic"
  ON clinics FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Clinic owners can insert clinic"
  ON clinics FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- ---- Professionals ----
DROP POLICY IF EXISTS "Anyone can view professionals"            ON professionals;
DROP POLICY IF EXISTS "Clinic owners can manage professionals"   ON professionals;

CREATE POLICY "Anyone can view professionals"
  ON professionals FOR SELECT USING (true);

CREATE POLICY "Clinic owners can manage professionals"
  ON professionals FOR ALL
  USING (
    clinic_id IN (SELECT id FROM clinics WHERE profile_id = auth.uid())
  );

-- ---- Professional availability ----
DROP POLICY IF EXISTS "Anyone can view professional availability"             ON professional_availability;
DROP POLICY IF EXISTS "Clinic owners can manage professional availability"    ON professional_availability;

CREATE POLICY "Anyone can view professional availability"
  ON professional_availability FOR SELECT USING (true);

CREATE POLICY "Clinic owners can manage professional availability"
  ON professional_availability FOR ALL
  USING (
    professional_id IN (
      SELECT p.id FROM professionals p
      JOIN clinics c ON p.clinic_id = c.id
      WHERE c.profile_id = auth.uid()
    )
  );

-- ---- Blocked times ----
DROP POLICY IF EXISTS "Anyone can view blocked times"           ON blocked_times;
DROP POLICY IF EXISTS "Clinic owners can manage blocked times"  ON blocked_times;

CREATE POLICY "Anyone can view blocked times"
  ON blocked_times FOR SELECT USING (true);

CREATE POLICY "Clinic owners can manage blocked times"
  ON blocked_times FOR ALL
  USING (
    professional_id IN (
      SELECT p.id FROM professionals p
      JOIN clinics c ON p.clinic_id = c.id
      WHERE c.profile_id = auth.uid()
    )
  );

-- ---- Appointments ----
DROP POLICY IF EXISTS "Users can view their own appointments"               ON appointments;
DROP POLICY IF EXISTS "Patients can create appointments"                    ON appointments;
DROP POLICY IF EXISTS "Patients can cancel their own appointments"          ON appointments;
DROP POLICY IF EXISTS "Clinics can update appointments for professionals"   ON appointments;

CREATE POLICY "Users can view their own appointments"
  ON appointments FOR SELECT
  USING (
    auth.uid() = patient_id OR
    professional_id IN (
      SELECT p.id FROM professionals p
      JOIN clinics c ON p.clinic_id = c.id
      WHERE c.profile_id = auth.uid()
    )
  );

CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id AND
    auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'patient')
  );

CREATE POLICY "Patients can cancel their own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Clinics can update appointments for professionals"
  ON appointments FOR UPDATE
  USING (
    professional_id IN (
      SELECT p.id FROM professionals p
      JOIN clinics c ON p.clinic_id = c.id
      WHERE c.profile_id = auth.uid()
    )
  );

-- ---- Messages ----
DROP POLICY IF EXISTS "Users can view messages for their appointments"  ON messages;
DROP POLICY IF EXISTS "Users can send messages for their appointments"  ON messages;

CREATE POLICY "Users can view messages for their appointments"
  ON messages FOR SELECT
  USING (
    appointment_id IN (SELECT id FROM appointments WHERE patient_id = auth.uid())
    OR
    appointment_id IN (
      SELECT a.id FROM appointments a
      JOIN professionals p ON a.professional_id = p.id
      JOIN clinics c ON p.clinic_id = c.id
      WHERE c.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages for their appointments"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND (
      appointment_id IN (SELECT id FROM appointments WHERE patient_id = auth.uid())
      OR
      appointment_id IN (
        SELECT a.id FROM appointments a
        JOIN professionals p ON a.professional_id = p.id
        JOIN clinics c ON p.clinic_id = c.id
        WHERE c.profile_id = auth.uid()
      )
    )
  );


-- ============================================================
-- PASSO 6 - TRIGGER DE CRIAÇÃO DE PERFIL (SIGNUP)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_type   user_type;
  v_full_name   TEXT;
  v_clinic_name TEXT;
BEGIN
  v_full_name   := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  v_user_type   := COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'patient');
  v_clinic_name := COALESCE(NEW.raw_user_meta_data->>'clinic_name', '');

  INSERT INTO public.profiles (id, email, full_name, user_type, phone)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_user_type,
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    full_name  = EXCLUDED.full_name,
    user_type  = EXCLUDED.user_type,
    phone      = EXCLUDED.phone,
    updated_at = NOW();

  IF v_user_type = 'clinic' THEN
    INSERT INTO public.clinics (profile_id, clinic_name, address, description)
    VALUES (
      NEW.id,
      v_clinic_name,
      COALESCE(NEW.raw_user_meta_data->>'address', ''),
      COALESCE(NEW.raw_user_meta_data->>'description', '')
    )
    ON CONFLICT (profile_id) DO UPDATE SET
      clinic_name = EXCLUDED.clinic_name,
      address     = EXCLUDED.address,
      description = EXCLUDED.description,
      updated_at  = NOW();
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- PASSO 7 - PROTEÇÃO CONTRA CONFLITO DE HORÁRIOS
-- ============================================================
DROP TRIGGER IF EXISTS trigger_check_appointment_overlap ON appointments;
DROP FUNCTION IF EXISTS check_appointment_overlap();

CREATE OR REPLACE FUNCTION check_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE professional_id    = NEW.professional_id
      AND appointment_date   = NEW.appointment_date
      AND status             = 'scheduled'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (
        (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
        (NEW.end_time   >  start_time AND NEW.end_time  <= end_time) OR
        (NEW.start_time <= start_time AND NEW.end_time  >= end_time)
      )
  ) THEN
    RAISE EXCEPTION 'Conflito de horário: Este horário já está ocupado';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_appointment_overlap
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION check_appointment_overlap();


-- ============================================================
-- PASSO 8 - STORAGE BUCKET (ANEXOS DE MENSAGENS)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Allow authenticated users to upload message attachments"  ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read their message attachments"            ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their message attachments"          ON storage.objects;

-- Upload
CREATE POLICY "Allow authenticated users to upload message attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'message-attachments');

-- Download
CREATE POLICY "Allow users to read their message attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'message-attachments' AND (
      auth.uid() IN (SELECT patient_id FROM appointments)
      OR
      auth.uid() IN (SELECT profile_id FROM clinics)
    )
  );

-- Delete
CREATE POLICY "Allow users to delete their message attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'message-attachments');


-- ============================================================
-- CONCLUÍDO ✅
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Setup completo!';
  RAISE NOTICE 'Tabelas criadas: profiles, clinics, professionals, professional_availability, blocked_times, appointments, messages';
  RAISE NOTICE 'RLS ativado em todas as tabelas';
  RAISE NOTICE 'Trigger de signup configurado';
  RAISE NOTICE 'Proteção contra conflito de horários configurada';
  RAISE NOTICE 'Storage bucket message-attachments criado';
END $$;
