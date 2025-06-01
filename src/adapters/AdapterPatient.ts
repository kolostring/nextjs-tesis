import { Patient } from "@/domain/entities/Patient";
import { Database } from "@/infrastructure/supabase/types/database.types";

export const PatientAdapter = {
  fromDataBaseOutput: (
    row: Database["public"]["CompositeTypes"]["patient_output"],
  ): Patient => ({
    id: row.id?.toString() ?? "",
    fullName: row.full_name ?? "",
    dateOfBirth: new Date(row.date_of_birth!),
    description: row.description ?? undefined,
    treatments:
      row.treatments?.map((val) => ({
        id: val.id?.toString() ?? "",
        eyeCondition: val.eye_condition ?? "",
        name: val.name ?? "",
        description: val.description ?? "",
        treatmentBlocks:
          val.treatment_blocks?.map((val) => ({
            beginningDate: new Date(val.beginning_date ?? ""),
            durationDays: val.duration_days ?? 0,
            iterations: val.iterations ?? 0,
            therapeuticActivities:
              val.therapeutic_activities?.map((val) => ({
                name: val.name ?? "",
                dayOfBlock: val.day_of_block ?? 0,
                beginningHour: (val.beginning_hour ??
                  "00:00") as `${number}:${number}`,
                endHour: (val.end_hour ?? "00:00") as `${number}:${number}`,
              })) ?? [],
          })) ?? [],
      })) ?? [],
  }),
};
