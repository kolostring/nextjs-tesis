import { AuthService } from "@/application/services/AuthService";
import { useDependencies } from "@/ioc/context/DependenciesProvider";
import { useQuery } from "@tanstack/react-query";
import { presentationQueryKeys } from "../const/presentationQueryKeys";

export default function useQueryGetUserData() {
  const { getContainer } = useDependencies();
  const authService = getContainer().resolve(AuthService);

  return useQuery({
    queryKey: presentationQueryKeys.user._def,
    queryFn: async () => {
      const res = await authService.getUser();

      if (!res.ok) {
        throw new Error(res.errors.map((e) => e.message).join(", "));
      }

      return res.value;
    },
  });
}
