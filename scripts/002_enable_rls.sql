-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Clinics policies
CREATE POLICY "Anyone can view clinics" ON clinics
  FOR SELECT USING (true);

CREATE POLICY "Clinic owners can update their clinic" ON clinics
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid() AND user_type = 'clinic'
    )
  );

CREATE POLICY "Clinic owners can insert their clinic" ON clinics
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid() AND user_type = 'clinic'
    )
  );

-- Professionals policies
CREATE POLICY "Anyone can view professionals" ON professionals
  FOR SELECT USING (true);

CREATE POLICY "Clinic owners can manage their professionals" ON professionals
  FOR ALL USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE profile_id = auth.uid()
    )
  );

-- Professional availability policies
CREATE POLICY "Anyone can view professional availability" ON professional_availability
  FOR SELECT USING (true);

CREATE POLICY "Clinic owners can manage professional availability" ON professional_availability
  FOR ALL USING (
    professional_id IN (
      SELECT p.id FROM professionals p
      JOIN clinics c ON p.clinic_id = c.id
      WHERE c.profile_id = auth.uid()
    )
  );

-- Blocked times policies
CREATE POLICY "Anyone can view blocked times" ON blocked_times
  FOR SELECT USING (true);

CREATE POLICY "Clinic owners can manage blocked times" ON blocked_times
  FOR ALL USING (
    professional_id IN (
      SELECT p.id FROM professionals p
      JOIN clinics c ON p.clinic_id = c.id
      WHERE c.profile_id = auth.uid()
    )
  );

-- Appointments policies
CREATE POLICY "Users can view their own appointments" ON appointments
  FOR SELECT USING (
    auth.uid() = patient_id OR
    professional_id IN (
      SELECT p.id FROM professionals p
      JOIN clinics c ON p.clinic_id = c.id
      WHERE c.profile_id = auth.uid()
    )
  );

CREATE POLICY "Patients can create appointments" ON appointments
  FOR INSERT WITH CHECK (
    auth.uid() = patient_id AND
    auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'patient')
  );

CREATE POLICY "Patients can cancel their own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Clinics can update appointments for their professionals" ON appointments
  FOR UPDATE USING (
    professional_id IN (
      SELECT p.id FROM professionals p
      JOIN clinics c ON p.clinic_id = c.id
      WHERE c.profile_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages for their appointments" ON messages
  FOR SELECT USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE patient_id = auth.uid()
    ) OR
    appointment_id IN (
      SELECT a.id FROM appointments a
      JOIN professionals p ON a.professional_id = p.id
      JOIN clinics c ON p.clinic_id = c.id
      WHERE c.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages for their appointments" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND (
      appointment_id IN (
        SELECT id FROM appointments WHERE patient_id = auth.uid()
      ) OR
      appointment_id IN (
        SELECT a.id FROM appointments a
        JOIN professionals p ON a.professional_id = p.id
        JOIN clinics c ON p.clinic_id = c.id
        WHERE c.profile_id = auth.uid()
      )
    )
  );
