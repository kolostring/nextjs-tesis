import { UpdateTreatmentForm } from "@/presentation/components/TreatmentForm";

interface PageProps {
  params: Promise<{ id: string; treatmentId: string }>;
}

export default async function NewTreatmentPage({ params }: PageProps) {
  const { id, treatmentId } = await params;

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-4">
      <header className="mb-16">
        <h1 className="text-4xl font-bold">Editar tratamiento</h1>
        <p>Edita el tratamiento y sus actividades terapéuticas</p>
      </header>
      <main>
        <UpdateTreatmentForm patientId={id} treatmentId={treatmentId} />
      </main>
    </div>
  );
}
