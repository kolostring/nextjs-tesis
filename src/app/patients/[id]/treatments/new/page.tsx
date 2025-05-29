import { NewTreatmentForm } from "@/presentation/components/TreatmentForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewTreatmentPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-4">
      <header className="mb-16">
        <h1 className="text-4xl font-bold">Nuevo tratamiento</h1>
        <p>
          Crea un nuevo tratamiento y sus respectivos bloques y actividades
          terapéuticas
        </p>
      </header>
      <main>
        <NewTreatmentForm patientId={id} />
      </main>
    </div>
  );
}
