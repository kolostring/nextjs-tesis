import { UpdatePatientForm } from "@/presentation/components/PatientForm";
import { Card, CardContent } from "@/presentation/components/ui/card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UpdatePatientPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto grid min-h-dvh max-w-2xl items-center px-4">
      <Card className="">
        <CardContent>
          <header className="mb-16">
            <h1 className="text-4xl font-bold">Editar Paciente</h1>
            <p>Edita la información básica del paciente</p>
          </header>
          <main>
            <UpdatePatientForm patientID={id} />
          </main>
        </CardContent>
      </Card>
    </div>
  );
}
