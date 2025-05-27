import { NewTreatmentForm } from "@/presentation/components/TreatmentForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewTreatmentPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-4">
      <NewTreatmentForm patientId={id} />
    </main>
  );
}
