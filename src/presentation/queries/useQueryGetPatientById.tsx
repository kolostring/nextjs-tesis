import { useDependencies } from "@/ioc/context/DependenciesProvider";
import { useQuery } from "@tanstack/react-query";
import { presentationQueryKeys } from "../const/presentationQueryKeys";
import { PatientRepository } from "@/domain/repositories/PatientRepository";

export default function useQueryGetPatientById(id: string) {
  const { getContainer } = useDependencies();
  const patientRepository = getContainer().resolve(PatientRepository);

  return useQuery({
    ...presentationQueryKeys.patients.byId(id),
    queryFn: async () => {
      const res = await patientRepository.getPatientById(id);

      if (!res.ok) {
        throw new Error(
          `Error al obtener el paciente: ${res.errors.map((e) => e.message).join(", ")}`,
        );
      }

      return res.value;
    },
  });
}
