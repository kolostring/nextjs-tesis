"use client";

import { Result } from "@/common/types/Result";
import { Patient } from "@/domain/entities/Patient";
import { PatientRepository } from "@/domain/repositories/PatientRepository";
import { infrastructureQueryKeys } from "@/infrastructure/consts/InfrastructureQueryKeys";
import { useDependencies } from "@/ioc/context/DependenciesProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function Test() {
  const queryCLient = useQueryClient();
  const { getContainer } = useDependencies();
  const patientRepository = getContainer().resolve(PatientRepository);

  const allPatientsQuery = useQuery<Result<Patient[]>>({
    ...infrastructureQueryKeys.patients.all(["1", "2"]),
    queryFn: () => patientRepository.getPatientsList(["1", "2"]),
  });

  const updatePatientMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await patientRepository.updatePatient({
        id,
        fullName: "CONCHETUMAREEEEEE",
      });

      console.log(res);

      queryCLient.invalidateQueries({
        queryKey: infrastructureQueryKeys.patients._def,
      });

      return res;
    },
  });

  if (allPatientsQuery.isPending) return <div>Pending</div>;
  if (!allPatientsQuery.data) return <div>No data</div>;
  if (!allPatientsQuery.data.ok) return <div>ERROR</div>;

  return (
    <div>
      {allPatientsQuery.data.value.map((patient) => (
        <div key={patient.id}>
          <span>{patient.id}</span>
          <span>{patient.fullName}</span>
          <span>{patient.description}</span>
          <span>{patient.dateOfBirth?.toDateString()}</span>
          <button onClick={() => updatePatientMutation.mutate(patient.id)}>
            LOL
          </button>
        </div>
      ))}
    </div>
  );
}
