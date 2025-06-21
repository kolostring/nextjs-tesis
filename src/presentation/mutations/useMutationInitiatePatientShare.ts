import { Result } from '@/common/types/Result';
import { StrictOmit } from '@/common/types/StrictOmit';
import { PatientRepository } from '@/domain/repositories/PatientRepository';
import { useDependencies } from '@/ioc/context/DependenciesProvider';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

type UseMutationInitiatePatientShareOptions = StrictOmit< UseMutationOptions<Result<string>, Error, string[], unknown>, "mutationFn">;

export default function useMutationInitiatePatientShare(props? :UseMutationInitiatePatientShareOptions ) {
  const repo = useDependencies().getContainer().resolve(PatientRepository);
  
  return useMutation({
    ...props,
    mutationFn: (patientIds: string[]) => repo.initiatePatientShare(patientIds),
  });
}