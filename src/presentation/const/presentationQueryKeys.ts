export const presentationQueryKeys = {
  patients: {
    all: (ids?: string[]) => ({
      queryKey: [ids],
    }),
    byId: (id: string) => ({
      queryKey: [id],
    }),
  },
};
