"use client";
import { ScanEyeIcon } from "lucide-react";
import useQueryGetUserData from "../queries/useQueryGetUserData";
import { Button } from "./ui/button";
import useMutationLogout from "../mutations/useMutationLogout";
import Spinner from "./ui/spinner";
import Link from "next/link";

export default function Navbar() {
  const userDataQuery = useQueryGetUserData();
  const logoutMutation = useMutationLogout({
    onSuccess: (data) => {
      if (data.ok) {
        location.reload();
      }
    },
  });

  return (
    <nav className="sticky top-0 container mx-auto flex h-fit max-w-2xl items-center justify-between px-4 py-4">
      <Link
        href="/"
        className="flex items-center gap-2 font-bold tracking-widest text-blue-400"
      >
        <ScanEyeIcon className="size-8" />
        <span className="hidden md:inline">MiViSTA</span>
      </Link>

      <div className="flex gap-2">
        {userDataQuery.isLoading ? (
          <Spinner />
        ) : (
          <>
            {userDataQuery.data ? (
              <Button variant="ghost" onClick={() => logoutMutation.mutate()}>
                {logoutMutation.isPending ? <Spinner /> : "Cerrar sesión"}
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Registrarse</Link>
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
