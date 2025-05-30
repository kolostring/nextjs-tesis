import { AuthService } from "@/application/services/AuthService";
import { useDependencies } from "@/ioc/context/DependenciesProvider";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { presentationQueryKeys } from "../const/presentationQueryKeys";
import { Result } from "@/common/types/Result";
import { StrictOmit } from "@/common/types/StrictOmit";

type UseMutationLogoutOptions = StrictOmit<
  UseMutationOptions<Result<undefined>, Error, void, unknown>,
  "mutationFn"
>;

export default function useMutationLogout(
  props: UseMutationLogoutOptions = {},
) {
  const { getContainer } = useDependencies();
  const authService = getContainer().resolve(AuthService);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...props,
    mutationFn: async () => {
      const res = await authService.logout();

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
