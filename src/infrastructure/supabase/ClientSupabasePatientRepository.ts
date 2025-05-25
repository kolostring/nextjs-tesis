import { PatientRepository, CreatePatientRequest, UpdatePatientRequest } from '@/domain/repositories/PatientRepository';
import { Patient } from '@/domain/entities/Patient';
import { PatientUser } from '@/domain/entities/PatientUser';
import { Result } from '@/common/types/Result';
import { createClient } from '@/utils/supabase/client';

export class ClientSupabasePatientRepository implements PatientRepository {
  private supabase = createClient();

  async getPatientById(id: string): Promise<Result<Patient>> {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const patient = new Patient({
        id: data.id.toString(),
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        fullName: data.full_name,
        dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
        description: data.description,
      });

      return Result.ok(patient);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  async getPatientsList(ids?: string[]): Promise<Result<Patient[]>> {
    try {
      let query = this.supabase.from('patients').select('*');
      
      if (ids && ids.length > 0) {
        query = query.in('id', ids);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const patients = data.map(row => new Patient({
        id: row.id.toString(),
        createdAt: row.created_at ? new Date(row.created_at) : undefined,
        fullName: row.full_name,
        dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : undefined,
        description: row.description,
      }));

      return Result.ok(patients);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  async getPatientsByUser(userId: string): Promise<Result<Patient[]>> {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .select(`
          *,
          patients_users!inner(user_id)
        `)
        .eq('patients_users.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const patients = data.map(row => new Patient({
        id: row.id.toString(),
        createdAt: row.created_at ? new Date(row.created_at) : undefined,
        fullName: row.full_name,
        dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : undefined,
        description: row.description,
      }));

      return Result.ok(patients);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  async createPatient(request: CreatePatientRequest, userId: string): Promise<Result<Patient>> {
    try {
      // First create the patient
      const { data: patientData, error: patientError } = await this.supabase
        .from('patients')
        .insert({
          full_name: request.fullName,
          date_of_birth: request.dateOfBirth?.toISOString().split('T')[0], // Convert to YYYY-MM-DD
          description: request.description,
        })
        .select()
        .single();

      if (patientError) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: patientError.message,
        }]);
      }

      // Then create the patient-user association
      const { error: associationError } = await this.supabase
        .from('patients_users')
        .insert({
          user_id: userId,
          patient_id: patientData.id,
        });

      if (associationError) {
        // If association fails, try to clean up the patient
        await this.supabase.from('patients').delete().eq('id', patientData.id);
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: associationError.message,
        }]);
      }

      const patient = new Patient({
        id: patientData.id.toString(),
        createdAt: patientData.created_at ? new Date(patientData.created_at) : undefined,
        fullName: patientData.full_name,
        dateOfBirth: patientData.date_of_birth ? new Date(patientData.date_of_birth) : undefined,
        description: patientData.description,
      });

      return Result.ok(patient);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  async updatePatient(request: UpdatePatientRequest): Promise<Result<Patient>> {
    try {
      const updateData: { full_name?: string; date_of_birth?: string; description?: string } = {};
      
      if (request.fullName !== undefined) updateData.full_name = request.fullName;
      if (request.dateOfBirth !== undefined) updateData.date_of_birth = request.dateOfBirth?.toISOString().split('T')[0];
      if (request.description !== undefined) updateData.description = request.description;

      const { data, error } = await this.supabase
        .from('patients')
        .update(updateData)
        .eq('id', request.id)
        .select()
        .single();

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const patient = new Patient({
        id: data.id.toString(),
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        fullName: data.full_name,
        dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
        description: data.description,
      });

      return Result.ok(patient);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  async deletePatient(id: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  async associatePatientWithUser(patientId: string, userId: string): Promise<Result<PatientUser>> {
    try {
      const { data, error } = await this.supabase
        .from('patients_users')
        .insert({
          user_id: userId,
          patient_id: patientId,
        })
        .select()
        .single();

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const patientUser = new PatientUser({
        id: data.id.toString(),
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        userId: data.user_id,
        patientId: data.patient_id.toString(),
      });

      return Result.ok(patientUser);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  async removePatientUserAssociation(patientId: string, userId: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase
        .from('patients_users')
        .delete()
        .eq('user_id', userId)
        .eq('patient_id', patientId);

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  async getUserPatientsAssociations(userId: string): Promise<Result<PatientUser[]>> {
    try {
      const { data, error } = await this.supabase
        .from('patients_users')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const patientUsers = data.map(row => new PatientUser({
        id: row.id.toString(),
        createdAt: row.created_at ? new Date(row.created_at) : undefined,
        userId: row.user_id,
        patientId: row.patient_id.toString(),
      }));

      return Result.ok(patientUsers);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }
} 