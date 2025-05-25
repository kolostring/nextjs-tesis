import { TherapeuticActivityRepository, CreateTherapeuticActivityRequest, UpdateTherapeuticActivityRequest } from '@/domain/repositories/TherapeuticActivityRepository';
import { TherapeuticActivity } from '@/domain/entities/TherapeuticActivity';
import { Result } from '@/common/types/Result';
import { createClient } from '@/utils/supabase/client';

export class ClientSupabaseTherapeuticActivityRepository implements TherapeuticActivityRepository {
  private supabase = createClient();

  async add(activity: TherapeuticActivity): Promise<Result<void>> {
    try {
      const { error } = await this.supabase
        .from('therapeutic_activity')
        .insert({
          id: activity.id,
          treatment_block_id: activity.treatmentBlockId,
          name: activity.name,
          description: activity.description,
          day_of_block: activity.dayOfBlock,
          beginning_hour: activity.beginningHour,
          end_hour: activity.endHour,
          created_at: activity.createdAt?.toISOString(),
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

  async listByTreatmentBlock(treatmentBlockId: string): Promise<Result<TherapeuticActivity[]>> {
    try {
      const { data, error } = await this.supabase
        .from('therapeutic_activity')
        .select('*')
        .eq('treatment_block_id', treatmentBlockId)
        .order('day_of_block', { ascending: true })
        .order('beginning_hour', { ascending: true });

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const activities = data.map(row => new TherapeuticActivity({
        id: row.id.toString(),
        createdAt: row.created_at ? new Date(row.created_at) : undefined,
        treatmentBlockId: row.treatment_block_id.toString(),
        name: row.name,
        description: row.description,
        dayOfBlock: row.day_of_block,
        beginningHour: row.beginning_hour,
        endHour: row.end_hour,
      }));

      return Result.ok(activities);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  async update(activity: TherapeuticActivity): Promise<Result<void>> {
    try {
      const { error } = await this.supabase
        .from('therapeutic_activity')
        .update({
          treatment_block_id: activity.treatmentBlockId,
          name: activity.name,
          description: activity.description,
          day_of_block: activity.dayOfBlock,
          beginning_hour: activity.beginningHour,
          end_hour: activity.endHour,
        })
        .eq('id', activity.id);

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
        .from('therapeutic_activity')
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

  async getById(id: string): Promise<Result<TherapeuticActivity>> {
    try {
      const { data, error } = await this.supabase
        .from('therapeutic_activity')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const activity = new TherapeuticActivity({
        id: data.id.toString(),
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        treatmentBlockId: data.treatment_block_id.toString(),
        name: data.name,
        description: data.description,
        dayOfBlock: data.day_of_block,
        beginningHour: data.beginning_hour,
        endHour: data.end_hour,
      });

      return Result.ok(activity);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  // Convenience methods with request objects
  async createActivity(request: CreateTherapeuticActivityRequest): Promise<Result<TherapeuticActivity>> {
    try {
      // Insert without specifying ID - let Supabase auto-generate it
      const { data, error } = await this.supabase
        .from('therapeutic_activity')
        .insert({
          treatment_block_id: request.treatmentBlockId,
          name: request.name,
          description: request.description,
          day_of_block: request.dayOfBlock,
          beginning_hour: request.beginningHour,
          end_hour: request.endHour,
        })
        .select()
        .single();

      if (error) {
        return Result.error([{
          code: 'SUPABASE_ERROR',
          message: error.message,
        }]);
      }

      const newActivity = new TherapeuticActivity({
        id: data.id.toString(),
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        treatmentBlockId: data.treatment_block_id.toString(),
        name: data.name,
        description: data.description,
        dayOfBlock: data.day_of_block,
        beginningHour: data.beginning_hour,
        endHour: data.end_hour,
      });

      return Result.ok(newActivity);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }

  async updateActivity(request: UpdateTherapeuticActivityRequest): Promise<Result<TherapeuticActivity>> {
    try {
      // First get the existing activity
      const existingResult = await this.getById(request.id);
      if (!existingResult.ok) {
        return existingResult;
      }

      const updatedActivity = new TherapeuticActivity({
        ...existingResult.value.props,
        treatmentBlockId: request.treatmentBlockId ?? existingResult.value.treatmentBlockId,
        name: request.name ?? existingResult.value.name,
        description: request.description ?? existingResult.value.description,
        dayOfBlock: request.dayOfBlock ?? existingResult.value.dayOfBlock,
        beginningHour: request.beginningHour ?? existingResult.value.beginningHour,
        endHour: request.endHour ?? existingResult.value.endHour,
      });

      const updateResult = await this.update(updatedActivity);
      if (!updateResult.ok) {
        return updateResult as Result<TherapeuticActivity>;
      }

      return Result.ok(updatedActivity);
    } catch (error) {
      return Result.error([{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }]);
    }
  }
} 