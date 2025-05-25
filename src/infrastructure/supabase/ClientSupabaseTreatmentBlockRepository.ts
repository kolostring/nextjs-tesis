import { TreatmentBlockRepository, CreateTreatmentBlockRequest, UpdateTreatmentBlockRequest } from '@/domain/repositories/TreatmentBlockRepository';
import { TreatmentBlock } from '@/domain/entities/TreatmentBlock';
import { Result } from '@/common/types/Result';
import { createClient } from '@/utils/supabase/client';

export class ClientSupabaseTreatmentBlockRepository implements TreatmentBlockRepository {
  private supabase = createClient();

  async add(treatmentBlock: TreatmentBlock): Promise<Result<void>> {
    try {
      const { error } = await this.supabase
        .from('treatment_blocks')
        .insert({
          id: treatmentBlock.id,
          treatment_id: treatmentBlock.treatmentId,
          beginning_date: treatmentBlock.beginningDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD
          duration_days: treatmentBlock.durationDays,
          iterations: treatmentBlock.iterations,
          created_at: treatmentBlock.createdAt?.toISOString(),
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

  async listByTreatment(treatmentId: string): Promise<Result<TreatmentBlock[]>> {
    try {
      const { data, error } = await this.supabase
        .from('treatment_blocks')
        .select('*')
        .eq('treatment_id', treatmentId)
        .order('created_at', { ascending: false });

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const treatmentBlocks = data.map(row => new TreatmentBlock({
        id: row.id.toString(),
        createdAt: row.created_at ? new Date(row.created_at) : undefined,
        treatmentId: row.treatment_id.toString(),
        beginningDate: new Date(row.beginning_date),
        durationDays: row.duration_days,
        iterations: row.iterations,
      }));

      return Result.ok(treatmentBlocks);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  async update(treatmentBlock: TreatmentBlock): Promise<Result<void>> {
    try {
      const { error } = await this.supabase
        .from('treatment_blocks')
        .update({
          treatment_id: treatmentBlock.treatmentId,
          beginning_date: treatmentBlock.beginningDate.toISOString().split('T')[0],
          duration_days: treatmentBlock.durationDays,
          iterations: treatmentBlock.iterations,
        })
        .eq('id', treatmentBlock.id);

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
        .from('treatment_blocks')
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

  async getById(id: string): Promise<Result<TreatmentBlock>> {
    try {
      const { data, error } = await this.supabase
        .from('treatment_blocks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const treatmentBlock = new TreatmentBlock({
        id: data.id.toString(),
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        treatmentId: data.treatment_id.toString(),
        beginningDate: new Date(data.beginning_date),
        durationDays: data.duration_days,
        iterations: data.iterations,
      });

      return Result.ok(treatmentBlock);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  // Convenience methods with request objects
  async createTreatmentBlock(request: CreateTreatmentBlockRequest): Promise<Result<TreatmentBlock>> {
    try {
      // Insert without specifying ID - let Supabase auto-generate it
      const { data, error } = await this.supabase
        .from('treatment_blocks')
        .insert({
          treatment_id: request.treatmentId,
          beginning_date: request.beginningDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD
          duration_days: request.durationDays,
          iterations: request.iterations,
        })
        .select()
        .single();

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const newTreatmentBlock = new TreatmentBlock({
        id: data.id.toString(),
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        treatmentId: data.treatment_id.toString(),
        beginningDate: new Date(data.beginning_date),
        durationDays: data.duration_days,
        iterations: data.iterations,
      });

      return Result.ok(newTreatmentBlock);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  async updateTreatmentBlock(request: UpdateTreatmentBlockRequest): Promise<Result<TreatmentBlock>> {
    try {
      // First get the existing treatment block
      const existingResult = await this.getById(request.id);
      if (!existingResult.ok) {
        return existingResult;
      }

      const updatedTreatmentBlock = new TreatmentBlock({
        ...existingResult.value.props,
        treatmentId: request.treatmentId ?? existingResult.value.treatmentId,
        beginningDate: request.beginningDate ?? existingResult.value.beginningDate,
        durationDays: request.durationDays ?? existingResult.value.durationDays,
        iterations: request.iterations ?? existingResult.value.iterations,
      });

      const updateResult = await this.update(updatedTreatmentBlock);
      if (!updateResult.ok) {
        return updateResult as Result<TreatmentBlock>;
      }

      return Result.ok(updatedTreatmentBlock);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }
} 