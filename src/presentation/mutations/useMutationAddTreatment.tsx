import { PatientRepository } from "@/domain/repositories/PatientRepository";
import { useDependencies } from "@/ioc/context/DependenciesProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { presentationQueryKeys } from "../const/presentationQueryKeys";
import { Treatment } from "@/domain/entities/Treatment";

export default function useMutationAddTreatment() {
  const { getContainer } = useDependencies();
  const patientRepository = getContainer().resolve(PatientRepository);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      patientID,
      req,
    }: {
      patientID: string;
      req: Treatment;
    }) => {
      const res = await patientRepository.addTreatment(patientID, req);

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
