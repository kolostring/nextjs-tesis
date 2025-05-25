-- Fix RLS Policies para resolver el error de inserción de pacientes
-- Ejecutar este SQL en Supabase Dashboard > SQL Editor

-- 1. Eliminar políticas existentes que pueden estar causando conflictos
DROP POLICY IF EXISTS "Users can insert their own patients" ON patients;
DROP POLICY IF EXISTS "Users can create their own patient associations" ON patients_users;

-- 2. Crear nuevas políticas más específicas para patients
CREATE POLICY "Authenticated users can create patients" ON patients
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can view their own patients" ON patients
FOR SELECT 
TO authenticated
USING (
  id IN (
    SELECT patient_id FROM patients_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own patients" ON patients
FOR UPDATE 
TO authenticated
USING (
  id IN (
    SELECT patient_id FROM patients_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own patients" ON patients
FOR DELETE 
TO authenticated
USING (
  id IN (
    SELECT patient_id FROM patients_users
    WHERE user_id = auth.uid()
  )
);

-- 3. Crear nuevas políticas para patients_users
CREATE POLICY "Users can create patient associations" ON patients_users
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own patient associations" ON patients_users
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own patient associations" ON patients_users
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own patient associations" ON patients_users
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- 4. Verificar que RLS está habilitado
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients_users ENABLE ROW LEVEL SECURITY; 