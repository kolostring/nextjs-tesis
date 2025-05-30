import { AuthService } from "@/application/services/AuthService";
import { useDependencies } from "@/ioc/context/DependenciesProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { presentationQueryKeys } from "../const/presentationQueryKeys";

export default function useMutationSignup() {
  const { getContainer } = useDependencies();
  const authService = getContainer().resolve(AuthService);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (req: { email: string; password: string }) => {
      const res = await authService.signup(req.email, req.password);

      if (res.ok) {
        queryClient.invalidateQueries({
          queryKey: presentationQueryKeys.user._def,
        });
        queryClient.invalidateQueries({
          queryKey: presentationQueryKeys.patients._def,
        });
      }

      return res;
    },
  });

  return mutation;
}
