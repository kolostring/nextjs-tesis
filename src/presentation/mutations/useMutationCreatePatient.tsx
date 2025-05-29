import { PatientRepository } from "@/domain/repositories/PatientRepository";
import { useDependencies } from "@/ioc/context/DependenciesProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { presentationQueryKeys } from "../const/presentationQueryKeys";
import { StrictOmit } from "@/common/types/StrictOmit";
import { Patient } from "@/domain/entities/Patient";

export default function useMutationCreatePatient() {
  const { getContainer } = useDependencies();
  const patientRepository = getContainer().resolve(PatientRepository);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (req: StrictOmit<Patient, "id" | "treatments">) => {
      const res = await patientRepository.createPatient(req);

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
