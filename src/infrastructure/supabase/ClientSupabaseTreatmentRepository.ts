import { TreatmentRepository, CreateTreatmentRequest, UpdateTreatmentRequest } from '@/domain/repositories/TreatmentRepository';
import { Treatment } from '@/domain/entities/Treatment';
import { Result } from '@/common/types/Result';
import { createClient } from '@/utils/supabase/client';

export class ClientSupabaseTreatmentRepository implements TreatmentRepository {
  private supabase = createClient();

  async add(treatment: Treatment): Promise<Result<void>> {
    try {
      const { error } = await this.supabase
        .from('treatments')
        .insert({
          id: treatment.id,
          patient_id: treatment.patientId,
          eye_condition: treatment.eyeCondition,
          name: treatment.name,
          description: treatment.description,
          created_at: treatment.createdAt?.toISOString(),
        });

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

  async listByPatient(patientId: string): Promise<Result<Treatment[]>> {
    try {
      const { data, error } = await this.supabase
        .from('treatments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const treatments = data.map(row => new Treatment({
        id: row.id.toString(),
        createdAt: row.created_at ? new Date(row.created_at) : undefined,
        patientId: row.patient_id.toString(),
        eyeCondition: row.eye_condition,
        name: row.name,
        description: row.description,
      }));

      return Result.ok(treatments);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  async update(treatment: Treatment): Promise<Result<void>> {
    try {
      const { error } = await this.supabase
        .from('treatments')
        .update({
          patient_id: treatment.patientId,
          eye_condition: treatment.eyeCondition,
          name: treatment.name,
          description: treatment.description,
        })
        .eq('id', treatment.id);

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

  async delete(id: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase
        .from('treatments')
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

  async getById(id: string): Promise<Result<Treatment>> {
    try {
      const { data, error } = await this.supabase
        .from('treatments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const treatment = new Treatment({
        id: data.id.toString(),
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        patientId: data.patient_id.toString(),
        eyeCondition: data.eye_condition,
        name: data.name,
        description: data.description,
      });

      return Result.ok(treatment);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  // Convenience methods with request objects
  async createTreatment(request: CreateTreatmentRequest): Promise<Result<Treatment>> {
    try {
      // Insert without specifying ID - let Supabase auto-generate it
      const { data, error } = await this.supabase
        .from('treatments')
        .insert({
          patient_id: request.patientId,
          eye_condition: request.eyeCondition,
          name: request.name,
          description: request.description,
        })
        .select()
        .single();

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const newTreatment = new Treatment({
        id: data.id.toString(),
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        patientId: data.patient_id.toString(),
        eyeCondition: data.eye_condition,
        name: data.name,
        description: data.description,
      });

      return Result.ok(newTreatment);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  async updateTreatment(request: UpdateTreatmentRequest): Promise<Result<Treatment>> {
    try {
      // First get the existing treatment
      const existingResult = await this.getById(request.id);
      if (!existingResult.ok) {
        return existingResult;
      }

      const updatedTreatment = new Treatment({
        ...existingResult.value.props,
        patientId: request.patientId ?? existingResult.value.patientId,
        eyeCondition: request.eyeCondition ?? existingResult.value.eyeCondition,
        name: request.name ?? existingResult.value.name,
        description: request.description ?? existingResult.value.description,
      });

      const updateResult = await this.update(updatedTreatment);
      if (!updateResult.ok) {
        return updateResult as Result<Treatment>;
      }

      return Result.ok(updatedTreatment);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }
} 