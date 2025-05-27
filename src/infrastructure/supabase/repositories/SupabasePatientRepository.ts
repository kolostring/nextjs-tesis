import { Result } from "@/common/types/Result";
import { Patient } from "@/domain/entities/Patient";
import { PatientRepository } from "@/domain/repositories/PatientRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";
import { Database } from "../types/database.types";

export default function SupabasePatientRepository(
  queryClient: QueryClient,
  supabaseClient: SupabaseClient<Database>,
): PatientRepository {
  return {
    async getPatientById(id) {
      try {
        const { data, error } = await supabaseClient
          .from("patients")
          .select("*, patients_users!inner(user_id)")
          .eq("id", Number.parseInt(id))
          .single();

        if (error) {
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: error.message,
            },
          ]);
        }

        const patient: Patient = {
          id: data.id.toString(),
          fullName: data.full_name,
          dateOfBirth: data.date_of_birth
            ? new Date(data.date_of_birth)
            : undefined,
          description: data.description ?? undefined,
          treatments: [],
        };

        return Result.ok(patient);
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },
    async getPatientsList(ids) {
      try {
        const userId = (await supabaseClient.auth.getUser()).data.user?.id;
        if (!userId)
          return Result.error([
            { code: "UNAUTHORIZED", message: "Not logged in" },
          ]);

        let query = supabaseClient
          .from("patients")
          .select("*, patients_users!inner(user_id)");

        if (ids && ids.length > 0) {
          query = query.in("id", ids.map(Number.parseInt));
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) {
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: error.message,
            },
          ]);
        }

        const patients = data.map(
          (row): Patient => ({
            id: row.id.toString(),
            fullName: row.full_name,
            dateOfBirth: row.date_of_birth
              ? new Date(row.date_of_birth)
              : undefined,
            description: row.description ?? undefined,
            treatments: [],
          }),
        );

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
        console.log(
          (await supabaseClient.auth.getSession()).data.session?.access_token,
        );
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

        const patient: Patient = {
          id: patientData.id.toString(),
          fullName: patientData.full_name,
          dateOfBirth: patientData.date_of_birth
            ? new Date(patientData.date_of_birth)
            : undefined,
          description: patientData.description ?? undefined,
          treatments: [],
        };

        return Result.ok(patient);
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },
    async updatePatient(req): Promise<Result<Patient>> {
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

        const { data, error } = await supabaseClient
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

        const patient: Patient = {
          id: data.id.toString(),
          fullName: data.full_name,
          dateOfBirth: data.date_of_birth
            ? new Date(data.date_of_birth)
            : undefined,
          description: data.description ?? undefined,
          treatments: [],
        };

        return Result.ok(patient);
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
        const { error } = await supabaseClient.from("treatments").insert({
          patient_id: parseInt(patientId),
          eye_condition: treatment.eyeCondition,
          name: treatment.name,
          description: treatment.description,
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
    async updateTreatment(patientId, treatment) {
      try {
        const { error } = await supabaseClient
          .from("treatments")
          .update({
            patient_id: Number.parseInt(patientId),
            eye_condition: treatment.eyeCondition,
            name: treatment.name,
            description: treatment.description,
          })
          .eq("id", Number.parseInt(treatment.id));

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
