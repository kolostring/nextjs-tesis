import { useDependencies } from "@/ioc/context/DependenciesProvider";
import { useQuery } from "@tanstack/react-query";
import { presentationQueryKeys } from "../const/presentationQueryKeys";
import { PatientRepository } from "@/domain/repositories/PatientRepository";

export default function useQueryGetAllPatients() {
  const { getContainer } = useDependencies();
  const patientRepository = getContainer().resolve(PatientRepository);

  return useQuery({
    ...presentationQueryKeys.patients.all(),
    queryFn: async () => {
      const res = await patientRepository.getPatientsList();

      if (!res.ok) {
        throw new Error(
          `Error al obtener los pacientes: ${res.errors.map((e) => e.message).join(", ")}`,
        );
      }

      return res.value;
    },
  });
}
