import { Result } from "@/common/types/Result";
import { Patient } from "@/domain/entities/Patient";
import { PatientRepository } from "@/domain/repositories/PatientRepository";
import { QueryClient } from "@tanstack/react-query";
import sleep from "@/presentation/utils/sleep";
import { infrastructureQueryKeys } from "../consts/InfrastructureQueryKeys";

const staticMockPatients: Patient[] = [
  {
    id: "1",
    fullName: "John Doe",
    dateOfBirth: new Date("1990-01-01"),
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    treatments: [],
  },
  {
    id: "2",
    fullName: "Jane Doe",
    dateOfBirth: new Date("1990-01-02"),
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    treatments: [],
  },
  {
    id: "3",
    fullName: "Bob Smith",
    dateOfBirth: new Date("1990-01-03"),
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    treatments: [],
  },
];

export function MockPatientRepository(
  queryClient: QueryClient,
): PatientRepository {
  return {
    getPatientById: async (id) => fetchPatientById(queryClient, id),
    getPatientsList: async (ids) => fetchAllPatients(queryClient, ids),
    createPatient: async (request) => {
      const data: Patient[] =
        queryClient.getQueryData(
          infrastructureQueryKeys.patients.all().queryKey,
        ) ?? [];
      const newPatient: Patient = {
        id: `${data.length}`,
        fullName: request.fullName,
        dateOfBirth: request.dateOfBirth,
        description: request.description,
        treatments: [],
      };

      queryClient.setQueryData(
        infrastructureQueryKeys.patients.byId(data.length + "").queryKey,
        (): Patient => newPatient,
      );

      queryClient.setQueryData(
        infrastructureQueryKeys.patients.all().queryKey,
        (oldData: Patient[] | undefined): Patient[] => {
          return [...(oldData ?? []), newPatient];
        },
      );

      return Result.ok(newPatient);
    },
    updatePatient: async (request) => {
      const data = await fetchPatientById(queryClient, request.id);

      if (!data.ok) {
        return Result.error([
          {
            code: "PATIENT_NOT_FOUND",
            message: `Patient with id ${request.id} not found`,
          },
        ]);
      }

      const newPatient: Patient = {
        ...data.value,
        fullName: request.fullName,
        dateOfBirth: request.dateOfBirth ?? data.value.dateOfBirth,
        description: request.description ?? data.value.description,
      };

      queryClient.setQueryData(
        infrastructureQueryKeys.patients.byId(request.id).queryKey,
        (): Patient => newPatient,
      );

      console.log(infrastructureQueryKeys.patients._def);

      queryClient.setQueriesData(
        {
          queryKey: infrastructureQueryKeys.patients._def,
        },
        (old: Result<Patient[]> | undefined): Result<Patient[]> | undefined => {
          console.log("old", old);
          if (!old?.ok) return undefined;
          return Result.ok(
            old.value.map((patient) => {
              if (patient.id === request.id) {
                return newPatient;
              }
              return patient;
            }),
          );
        },
      );

      return Result.ok(newPatient);
    },
    deletePatient: async (id) => {
      const data = await fetchPatientById(queryClient, id);

      if (!data.ok) {
        return Result.error([
          {
            code: "PATIENT_NOT_FOUND",
            message: `Patient with id ${id} not found`,
          },
        ]);
      }

      queryClient.invalidateQueries({
        queryKey: infrastructureQueryKeys.patients._def,
      });

      queryClient.setQueriesData(
        {
          queryKey: infrastructureQueryKeys.patients._def,
        },
        (oldData: Result<Patient[]> | undefined) => {
          if (!oldData?.ok) return undefined;
          return oldData.value.filter((patient) => patient.id !== id);
        },
      );

      return Result.ok(undefined);
    },
    addTreatment: async (patientId, treatment) => {
      return Result.ok(undefined);
    },
    updateTreatment: async (patientId, treatment) => {
      return Result.ok(undefined);
    },
  };
  async function fetchPatientById(queryClient: QueryClient, id: string) {
    const data = await queryClient.fetchQuery({
      ...infrastructureQueryKeys.patients.byId(id),
      queryFn: () => {
        const patient = staticMockPatients.find((patient) => patient.id === id);

        return patient
          ? Result.ok(patient)
          : Result.error([
              {
                code: "PATIENT_NOT_FOUND",
                message: `Patient with id ${id} not found`,
              },
            ]);
      },
    });

    if (!data.ok) {
      queryClient.invalidateQueries(infrastructureQueryKeys.patients.byId(id));
    }

    return data;
  }

  async function fetchAllPatients(queryClient: QueryClient, ids?: string[]) {
    const data = await queryClient.fetchQuery({
      ...infrastructureQueryKeys.patients.all(ids),
      queryFn: async () => {
        await sleep(1000);
        return Result.ok(
          staticMockPatients.filter(
            (patient) => ids?.includes(patient.id) ?? true,
          ),
        );
      },
    });

    return data;
  }
}
