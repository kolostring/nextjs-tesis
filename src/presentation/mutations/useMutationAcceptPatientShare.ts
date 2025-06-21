import { PatientRepository } from '@/domain/repositories/PatientRepository';
import { useDependencies } from '@/ioc/context/DependenciesProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
export default function useMutationAcceptPatientShare() {
  const repo = useDependencies().getContainer().resolve(PatientRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shareCode: string) => {
      
      const res = await repo.acceptPatientShare(shareCode)
      if (res.ok) {
        queryClient.invalidateQueries();
      }
      return res;
    },
  });
}