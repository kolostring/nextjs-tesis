import { createQueryKeyStore } from "@lukemorales/query-key-factory";

export const infrastructureQueryKeys = createQueryKeyStore({
  patients: {
    all: (ids?: string[]) => ({
      queryKey: [ids],
    }),
    byId: (id: string) => ({
      queryKey: [id],
    }),
    byUser: (userId: string) => ({
      queryKey: [userId],
    }),
  },
  treatments: {
    byPatient: (patientId: string) => ({
      queryKey: [patientId],
    }),
    byId: (id: string) => ({
      queryKey: [id],
    }),
  },
});
