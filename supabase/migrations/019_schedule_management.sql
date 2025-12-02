-- ===================================
-- MIGRATION 019: Schedule Management Module
-- Add availability and appointments
-- ===================================

-- 1. Update professional_details with settings
ALTER TABLE professional_details
ADD COLUMN default_session_duration INTEGER DEFAULT 50, -- in minutes
ADD COLUMN break_between_sessions INTEGER DEFAULT 10;   -- in minutes

-- 2. Create Professional Availability Table
CREATE TABLE professional_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT professional_availability_time_check CHECK (end_time > start_time)
);

CREATE INDEX idx_professional_availability_user ON professional_availability(user_id);
CREATE INDEX idx_professional_availability_day ON professional_availability(day_of_week);

COMMENT ON TABLE professional_availability IS 'Recurring weekly availability for professionals';

-- 3. Create Appointments Table
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT appointments_time_check CHECK (end_time > start_time)
);

CREATE INDEX idx_appointments_clinica ON appointments(clinica_id);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(start_time);

COMMENT ON TABLE appointments IS 'Individual appointments';

-- 4. Enable RLS
ALTER TABLE professional_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Professional Availability

-- Public read (within clinic) - needed for booking
CREATE POLICY "Ver disponibilidade da clínica"
  ON professional_availability FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = professional_availability.user_id
        AND users.clinica_id = public.user_clinica_id()
    )
  );

-- Professional manages own availability
CREATE POLICY "Gerenciar própria disponibilidade"
  ON professional_availability FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. RLS Policies for Appointments

-- View appointments:
-- 1. Professional sees their own
-- 2. Clinic Admin sees all in clinic
-- 3. Patient sees their own (if we add patient login later, currently patients don't login but let's add the check for future proofing or if patient_id linked to a user)
-- For now, assuming patients are just records, so we focus on Professional and Admin.

CREATE POLICY "Ver agendamentos"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    (professional_id = auth.uid()) OR
    (clinica_id = public.user_clinica_id() AND public.is_clinic_admin())
  );

-- Create appointments:
-- Professional creates for themselves
-- Clinic Admin creates for anyone in clinic
CREATE POLICY "Criar agendamentos"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    (professional_id = auth.uid()) OR
    (clinica_id = public.user_clinica_id() AND public.is_clinic_admin())
  );

-- Update appointments:
-- Professional updates their own
-- Clinic Admin updates anyone in clinic
CREATE POLICY "Atualizar agendamentos"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    (professional_id = auth.uid()) OR
    (clinica_id = public.user_clinica_id() AND public.is_clinic_admin())
  )
  WITH CHECK (
    (professional_id = auth.uid()) OR
    (clinica_id = public.user_clinica_id() AND public.is_clinic_admin())
  );

-- Delete appointments:
-- Professional deletes their own
-- Clinic Admin deletes anyone in clinic
CREATE POLICY "Deletar agendamentos"
  ON appointments FOR DELETE
  TO authenticated
  USING (
    (professional_id = auth.uid()) OR
    (clinica_id = public.user_clinica_id() AND public.is_clinic_admin())
  );

-- 7. Triggers for updated_at
CREATE TRIGGER update_professional_availability_updated_at BEFORE UPDATE ON professional_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
