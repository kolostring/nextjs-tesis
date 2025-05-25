import { Result } from "@/common/types/Result";
import { Patient } from "@/domain/entities/Patient";
import { PatientUser } from "@/domain/entities/PatientUser";
import { PatientRepository, CreatePatientRequest, UpdatePatientRequest } from "@/domain/repositories/PatientRepository";
import { QueryClient } from "@tanstack/react-query";
import sleep from "@/presentation/utils/sleep";
import { infrastructureQueryKeys } from "../consts/InfrastructureQueryKeys";

const staticMockPatients: Patient[] = [
  new Patient({
    id: "1",
    fullName: "John Doe",
    dateOfBirth: new Date("1990-01-01"),
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    createdAt: new Date(),
  }),
  new Patient({
    id: "2",
    fullName: "Jane Doe",
    dateOfBirth: new Date("1990-01-02"),
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    createdAt: new Date(),
  }),
  new Patient({
    id: "3",
    fullName: "Bob Smith",
    dateOfBirth: new Date("1990-01-03"),
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    createdAt: new Date(),
  }),
];

// Mock patient-user associations
const staticMockPatientUsers: PatientUser[] = [
  new PatientUser({
    id: "1",
    userId: "mock-user-1",
    patientId: "1",
    createdAt: new Date(),
  }),
  new PatientUser({
    id: "2",
    userId: "mock-user-1",
    patientId: "2",
    createdAt: new Date(),
  }),
  new PatientUser({
    id: "3",
    userId: "mock-user-1",
    patientId: "3",
    createdAt: new Date(),
  }),
];

export function MockPatientRepository(
  queryClient: QueryClient,
): PatientRepository {
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

  return {
    getPatientById: async (id) => fetchPatientById(queryClient, id),
    getPatientsList: async (ids) => fetchAllPatients(queryClient, ids),
    getPatientsByUser: async (userId) => {
      // Filter patients by user associations
      const userPatients = staticMockPatientUsers
        .filter(pu => pu.userId === userId)
        .map(pu => staticMockPatients.find(p => p.id === pu.patientId))
        .filter(p => p !== undefined) as Patient[];
      
      return Result.ok(userPatients);
    },
    createPatient: async (request: CreatePatientRequest, userId: string) => {
      const data: Patient[] =
        queryClient.getQueryData(
          infrastructureQueryKeys.patients.all().queryKey,
        ) ?? [];
      
      const newPatient = new Patient({
        id: `${data.length + 1}`,
        fullName: request.fullName,
        dateOfBirth: request.dateOfBirth,
        description: request.description,
        createdAt: new Date(),
      });

      queryClient.setQueryData(
        infrastructureQueryKeys.patients.byId(newPatient.id).queryKey,
        (): Patient => newPatient,
      );

      queryClient.setQueryData(
        infrastructureQueryKeys.patients.all().queryKey,
        (oldData: Patient[] | undefined): Patient[] => {
          return [...(oldData ?? []), newPatient];
        },
      );

      // Create patient-user association
      const newPatientUser = new PatientUser({
        id: `${staticMockPatientUsers.length + 1}`,
        userId,
        patientId: newPatient.id,
        createdAt: new Date(),
      });
      staticMockPatientUsers.push(newPatientUser);

      return Result.ok(newPatient);
    },
    updatePatient: async (request: UpdatePatientRequest) => {
      const data = await fetchPatientById(queryClient, request.id);

      if (!data.ok) {
        return Result.error([
          {
            code: "PATIENT_NOT_FOUND",
            message: `Patient with id ${request.id} not found`,
          },
        ]);
      }

      const newPatient = new Patient({
        ...data.value.props,
        fullName: request.fullName ?? data.value.fullName,
        dateOfBirth: request.dateOfBirth ?? data.value.dateOfBirth,
        description: request.description ?? data.value.description,
      });

      queryClient.setQueryData(
        infrastructureQueryKeys.patients.byId(request.id).queryKey,
        (): Patient => newPatient,
      );

      queryClient.setQueriesData(
        {
          queryKey: infrastructureQueryKeys.patients._def,
        },
        (old: Result<Patient[]> | undefined): Result<Patient[]> | undefined => {
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
    
    // Patient-User association methods
    associatePatientWithUser: async (patientId, userId) => {
      const existingAssociation = staticMockPatientUsers.find(
        pu => pu.patientId === patientId && pu.userId === userId
      );
      
      if (existingAssociation) {
        return Result.ok(existingAssociation);
      }
      
      const newPatientUser = new PatientUser({
        id: `${staticMockPatientUsers.length + 1}`,
        userId,
        patientId,
        createdAt: new Date(),
      });
      
      staticMockPatientUsers.push(newPatientUser);
      return Result.ok(newPatientUser);
    },
    
    removePatientUserAssociation: async (patientId, userId) => {
      const index = staticMockPatientUsers.findIndex(
        pu => pu.patientId === patientId && pu.userId === userId
      );
      
      if (index === -1) {
        return Result.error([{
          code: "ASSOCIATION_NOT_FOUND",
          message: "Patient-User association not found",
        }]);
      }
      
      staticMockPatientUsers.splice(index, 1);
      return Result.ok(undefined);
    },
    
    getUserPatientsAssociations: async (userId) => {
      const userAssociations = staticMockPatientUsers.filter(
        pu => pu.userId === userId
      );
      return Result.ok(userAssociations);
    },
  };
}
