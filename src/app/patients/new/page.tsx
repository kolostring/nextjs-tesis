import { NewPatientForm } from "@/presentation/components/PatientForm";
import { Card, CardContent } from "@/presentation/components/ui/card";

export default async function CreatePatientPage() {
  return (
    <div className="mx-auto grid w-full max-w-2xl items-center px-4">
      <Card className="">
        <CardContent>
          <header className="mb-16">
            <h1 className="text-4xl font-bold">Crear paciente</h1>
            <p className="max-w-[40ch]">
              Añade la información básica de un paciente para comenzar a
              gestionar sus tratamientos
            </p>
          </header>
          <main>
            <NewPatientForm />
          </main>
        </CardContent>
      </Card>
    </div>
  );
}
