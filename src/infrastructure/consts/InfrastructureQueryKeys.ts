import { createQueryKeyStore } from "@lukemorales/query-key-factory";

export const infrastructureQueryKeys = createQueryKeyStore({
  patients: {
    all: (ids?: string[]) => ({
      queryKey: [ids],
    }),
    byId: (id: string) => ({
      queryKey: [id],
    }),
  },
});
