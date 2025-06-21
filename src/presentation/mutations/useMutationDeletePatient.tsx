import { PatientRepository } from "@/domain/repositories/PatientRepository";
import { useDependencies } from "@/ioc/context/DependenciesProvider";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { presentationQueryKeys } from "../const/presentationQueryKeys";
import { Result } from "@/common/types/Result";
import { StrictOmit } from "@/common/types/StrictOmit";

export type UseMutationDeletePatientOptions = StrictOmit<
  UseMutationOptions<Result<void>, Error, string, unknown>,
  "mutationFn"
>;

export default function useMutationDeletePatient(
  props?: UseMutationDeletePatientOptions,
) {
  const { getContainer } = useDependencies();
  const patientRepository = getContainer().resolve(PatientRepository);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...props,
    mutationFn: async (id: string) => {
      const res = await patientRepository.deletePatient(id);

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
