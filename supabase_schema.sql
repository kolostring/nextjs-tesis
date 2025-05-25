-- Supabase Database Schema
-- Sistema de Gestión de Pacientes y Tratamientos

-- 1. Patients table
CREATE TABLE patients (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  full_name VARCHAR NOT NULL,
  date_of_birth DATE,
  description VARCHAR
);

-- 2. Patients-Users junction table (many-to-many relationship)
CREATE TABLE patients_users (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  UNIQUE(user_id, patient_id)
);

-- 3. Treatments table
CREATE TABLE treatments (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  eye_condition VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description VARCHAR
);

-- 4. Treatment blocks table
CREATE TABLE treatment_blocks (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  treatment_id BIGINT NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  beginning_date DATE NOT NULL,
  duration_days BIGINT NOT NULL,
  iterations BIGINT NOT NULL
);

-- 5. Therapeutic activities table
CREATE TABLE therapeutic_activity (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  treatment_block_id BIGINT NOT NULL REFERENCES treatment_blocks(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description VARCHAR,
  day_of_block BIGINT NOT NULL,
  beginning_hour TIME NOT NULL,
  end_hour TIME NOT NULL
);

-- 6. Notes table
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  user_patient_id BIGINT NOT NULL REFERENCES patients_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title VARCHAR,
  description VARCHAR
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapeutic_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Patients: Users can only access patients they are associated with
CREATE POLICY "Users can view their own patients" ON patients
FOR SELECT USING (
  id IN (
    SELECT patient_id FROM patients_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own patients" ON patients
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own patients" ON patients
FOR UPDATE USING (
  id IN (
    SELECT patient_id FROM patients_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own patients" ON patients
FOR DELETE USING (
  id IN (
    SELECT patient_id FROM patients_users
    WHERE user_id = auth.uid()
  )
);

-- Patients-Users: Users can only manage their own associations
CREATE POLICY "Users can view their own patient associations" ON patients_users
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own patient associations" ON patients_users
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own patient associations" ON patients_users
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own patient associations" ON patients_users
FOR DELETE USING (user_id = auth.uid());

-- Treatments: Users can only access treatments for their patients
CREATE POLICY "Users can view treatments for their patients" ON treatments
FOR SELECT USING (
  patient_id IN (
    SELECT patient_id FROM patients_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create treatments for their patients" ON treatments
FOR INSERT WITH CHECK (
  patient_id IN (
    SELECT patient_id FROM patients_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update treatments for their patients" ON treatments
FOR UPDATE USING (
  patient_id IN (
    SELECT patient_id FROM patients_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete treatments for their patients" ON treatments
FOR DELETE USING (
  patient_id IN (
    SELECT patient_id FROM patients_users
    WHERE user_id = auth.uid()
  )
);

-- Treatment Blocks: Users can only access treatment blocks for their patients' treatments
CREATE POLICY "Users can view treatment blocks for their patients" ON treatment_blocks
FOR SELECT USING (
  treatment_id IN (
    SELECT t.id FROM treatments t
    INNER JOIN patients_users pu ON t.patient_id = pu.patient_id
    WHERE pu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create treatment blocks for their patients" ON treatment_blocks
FOR INSERT WITH CHECK (
  treatment_id IN (
    SELECT t.id FROM treatments t
    INNER JOIN patients_users pu ON t.patient_id = pu.patient_id
    WHERE pu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update treatment blocks for their patients" ON treatment_blocks
FOR UPDATE USING (
  treatment_id IN (
    SELECT t.id FROM treatments t
    INNER JOIN patients_users pu ON t.patient_id = pu.patient_id
    WHERE pu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete treatment blocks for their patients" ON treatment_blocks
FOR DELETE USING (
  treatment_id IN (
    SELECT t.id FROM treatments t
    INNER JOIN patients_users pu ON t.patient_id = pu.patient_id
    WHERE pu.user_id = auth.uid()
  )
);

-- Therapeutic Activities: Users can only access activities for their patients' treatment blocks
CREATE POLICY "Users can view therapeutic activities for their patients" ON therapeutic_activity
FOR SELECT USING (
  treatment_block_id IN (
    SELECT tb.id FROM treatment_blocks tb
    INNER JOIN treatments t ON tb.treatment_id = t.id
    INNER JOIN patients_users pu ON t.patient_id = pu.patient_id
    WHERE pu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create therapeutic activities for their patients" ON therapeutic_activity
FOR INSERT WITH CHECK (
  treatment_block_id IN (
    SELECT tb.id FROM treatment_blocks tb
    INNER JOIN treatments t ON tb.treatment_id = t.id
    INNER JOIN patients_users pu ON t.patient_id = pu.patient_id
    WHERE pu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update therapeutic activities for their patients" ON therapeutic_activity
FOR UPDATE USING (
  treatment_block_id IN (
    SELECT tb.id FROM treatment_blocks tb
    INNER JOIN treatments t ON tb.treatment_id = t.id
    INNER JOIN patients_users pu ON t.patient_id = pu.patient_id
    WHERE pu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete therapeutic activities for their patients" ON therapeutic_activity
FOR DELETE USING (
  treatment_block_id IN (
    SELECT tb.id FROM treatment_blocks tb
    INNER JOIN treatments t ON tb.treatment_id = t.id
    INNER JOIN patients_users pu ON t.patient_id = pu.patient_id
    WHERE pu.user_id = auth.uid()
  )
);

-- Notes: Users can only access notes for their patient associations
CREATE POLICY "Users can view notes for their patients" ON notes
FOR SELECT USING (
  user_patient_id IN (
    SELECT id FROM patients_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create notes for their patients" ON notes
FOR INSERT WITH CHECK (
  user_patient_id IN (
    SELECT id FROM patients_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update notes for their patients" ON notes
FOR UPDATE USING (
  user_patient_id IN (
    SELECT id FROM patients_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete notes for their patients" ON notes
FOR DELETE USING (
  user_patient_id IN (
    SELECT id FROM patients_users
    WHERE user_id = auth.uid()
  )
);

-- Indexes for better performance
CREATE INDEX idx_patients_users_user_id ON patients_users(user_id);
CREATE INDEX idx_patients_users_patient_id ON patients_users(patient_id);
CREATE INDEX idx_treatments_patient_id ON treatments(patient_id);
CREATE INDEX idx_treatment_blocks_treatment_id ON treatment_blocks(treatment_id);
CREATE INDEX idx_therapeutic_activity_treatment_block_id ON therapeutic_activity(treatment_block_id);
CREATE INDEX idx_notes_user_patient_id ON notes(user_patient_id); 