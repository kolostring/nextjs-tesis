"use client";
import DependenciesProvider from "./context/DependenciesProvider";
import { buildContainer, buildManager } from "./common/utils";
import { PatientRepository } from "@/domain/repositories/PatientRepository";
import { TreatmentRepository } from "@/domain/repositories/TreatmentRepository";
import { TreatmentBlockRepository } from "@/domain/repositories/TreatmentBlockRepository";
import { TherapeuticActivityRepository } from "@/domain/repositories/TherapeuticActivityRepository";
import { ClientSupabasePatientRepository } from "@/infrastructure/supabase/ClientSupabasePatientRepository";
import { ClientSupabaseTreatmentRepository } from "@/infrastructure/supabase/ClientSupabaseTreatmentRepository";
import { ClientSupabaseTreatmentBlockRepository } from "@/infrastructure/supabase/ClientSupabaseTreatmentBlockRepository";
import { ClientSupabaseTherapeuticActivityRepository } from "@/infrastructure/supabase/ClientSupabaseTherapeuticActivityRepository";

export default function DIConfig({ children }: { children: React.ReactNode }) {
  const manager = buildManager().registerContainer(
    buildContainer()
      .register(PatientRepository, new ClientSupabasePatientRepository())
      .register(TreatmentRepository, new ClientSupabaseTreatmentRepository())
      .register(TreatmentBlockRepository, new ClientSupabaseTreatmentBlockRepository())
      .register(TherapeuticActivityRepository, new ClientSupabaseTherapeuticActivityRepository()),
  );

  return (
    <DependenciesProvider manager={manager}>{children}</DependenciesProvider>
  );
}
