import { Result } from "@/common/types/Result";
import { Patient } from "@/domain/entities/Patient";
import { PatientRepository } from "@/domain/repositories/PatientRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";
import { Database } from "../types/database.types";
import { PatientAdapter } from "@/adapters/AdapterPatient";

export default function SupabasePatientRepository(
  queryClient: QueryClient,
  supabaseClient: SupabaseClient<Database>,
): PatientRepository {
  return {
    async getPatientById(id) {
      const res = await this.getPatientsList([id]);
      if (res.ok) {
        return Result.ok(res.value[0]);
      }
      return res;
    },
    async getPatientsList(ids) {
      try {
        const { data } = await supabaseClient.rpc("get_patients_list", {
          p_ids: ids?.map(Number.parseInt),
        });

        const patients =
          data?.map((row): Patient => PatientAdapter.fromDataBaseOutput(row)) ??
          [];

        return Result.ok(patients);
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },
    createPatient: async (req) => {
      try {
        // First create the patient
        const { data: patientData, error: patientError } = await supabaseClient
          .from("patients")
          .insert({
            full_name: req.fullName,
            date_of_birth: req.dateOfBirth?.toISOString().split("T")[0], // Convert to YYYY-MM-DD
            description: req.description,
          })
          .select()
          .single();

        if (patientError) {
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: patientError.message,
            },
          ]);
        }

        // Then create the patient-user association
        const { error: associationError } = await supabaseClient
          .from("patients_users")
          .insert({
            patient_id: patientData.id,
          });

        if (associationError) {
          // If association fails, try to clean up the patient
          await supabaseClient
            .from("patients")
            .delete()
            .eq("id", patientData.id);
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: associationError.message,
            },
          ]);
        }

        return Result.ok(undefined);
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },
    async updatePatient(req) {
      try {
        const updateData: {
          full_name?: string;
          date_of_birth?: string;
          description?: string;
        } = {
          full_name: req.fullName,
          date_of_birth: req.dateOfBirth?.toISOString().split("T")[0], // Convert to YYYY-MM-DD
          description: req.description,
        };

        const { error } = await supabaseClient
          .from("patients")
          .update(updateData)
          .eq("id", Number.parseInt(req.id))
          .select()
          .single();

        if (error) {
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: error.message,
            },
          ]);
        }

        return Result.ok(undefined);
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },
    async deletePatient(id: string): Promise<Result<void>> {
      try {
        const { error } = await supabaseClient
          .from("patients")
          .delete()
          .eq("id", Number.parseInt(id));

        if (error) {
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: error.message,
            },
          ]);
        }

        return Result.ok(undefined);
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },

    async addTreatment(patientId, treatment) {
      try {
        const { error } = await supabaseClient.rpc("insert_full_treatment", {
          p_patient_id: Number.parseInt(patientId),
          p_eye_condition: treatment.eyeCondition,
          p_name: treatment.name,
          p_description: treatment.description ?? "",
          p_blocks: treatment.treatmentBlocks.map((val) => ({
            beginning_date: val.beginningDate.toISOString(),
            duration_days: val.durationDays,
            iterations: val.iterations,
            activities: val.therapeuticActivities.map((val) => ({
              name: val.name,
              description: "",
              day_of_block: val.dayOfBlock,
              beginning_hour: val.beginningHour,
              end_hour: val.endHour,
            })),
          })),
        });

        if (error) {
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: error.message,
            },
          ]);
        }

        return Result.ok(undefined);
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },
    async updateTreatment(treatment) {
      try {
        const { error } = await supabaseClient.rpc("update_full_treatment", {
          p_treatment_id: Number.parseInt(treatment.id),
          p_eye_condition: treatment.eyeCondition,
          p_name: treatment.name,
          p_description: treatment.description ?? "",
          p_blocks: treatment.treatmentBlocks?.map((val) => ({
            beginning_date: val.beginningDate.toISOString(),
            duration_days: val.durationDays,
            iterations: val.iterations,
            activities: val.therapeuticActivities.map((val) => ({
              name: val.name,
              description: "",
              day_of_block: val.dayOfBlock,
              beginning_hour: val.beginningHour,
              end_hour: val.endHour,
            })),
          })),
        });

        if (error) {
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: error.message,
            },
          ]);
        }

        return Result.ok(undefined);
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },
    async deleteTreatment(treatmentId) {
      try {
        const { error } = await supabaseClient
          .from("treatments")
          .delete()
          .eq("id", Number.parseInt(treatmentId));

        if (error) {
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: error.message,
            },
          ]);
        }

        return Result.ok(undefined);
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },
    async initiatePatientShare(patientIds) {
      try {
        const { data, error } = await supabaseClient.rpc(
          "create_share_patients",
          {
            p_patient_ids: patientIds.map((id) => Number.parseInt(id)),
          },
        );
        if (error) {
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: error.message,
            },
          ]);
        }
        return Result.ok(data);
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },
    async acceptPatientShare(shareCode) {
      try {
        const { error } = await supabaseClient.rpc("accept_share_patients", {
          p_share_code: shareCode,
        });
        if (error) {
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: error.message,
            },
          ]);
        }
        return Result.ok(undefined);
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },
  };
}
