import { PatientRepository } from "@/domain/repositories/PatientRepository";
import { useDependencies } from "@/ioc/context/DependenciesProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { presentationQueryKeys } from "../const/presentationQueryKeys";

export default function useMutationDeleteTreatment() {
  const { getContainer } = useDependencies();
  const patientRepository = getContainer().resolve(PatientRepository);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await patientRepository.deleteTreatment(id);

      if (res.ok) {
        queryClient.invalidateQueries({
          queryKey: presentationQueryKeys.patients._def,
        });
      }

      return res;
    },
  });

  return mutation;
}
