"use client";
import DependenciesProvider from "./context/DependenciesProvider";
import { buildContainer, buildManager } from "./common/utils";
import { PatientRepository } from "@/domain/repositories/PatientRepository";
import SupabasePatientRepository from "@/infrastructure/supabase/repositories/SupabasePatientRepository";
import { isServer, QueryClient } from "@tanstack/react-query";
import { AuthService } from "@/application/services/AuthService";
import SupabaseAuthService from "@/infrastructure/supabase/services/SupabaseAuthService";
import { createBrowserClient } from "@supabase/ssr";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 6 * 1000, // 6 sec
        gcTime: 10 * 1000, // 10 sec
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;
export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    browserQueryClient ??= makeQueryClient();
    return browserQueryClient;
  }
}

function makeSupabaseClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export default function DIConfig({ children }: { children: React.ReactNode }) {
  const manager = buildManager().registerContainer(
    buildContainer()
      .register(
        PatientRepository,
        SupabasePatientRepository(getQueryClient(), makeSupabaseClient()),
      )
      .register(AuthService, SupabaseAuthService(makeSupabaseClient())),
  );

  return (
    <DependenciesProvider manager={manager}>{children}</DependenciesProvider>
  );
}
