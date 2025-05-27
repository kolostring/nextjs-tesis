import NewPatientForm from "@/presentation/components/NewPatientForm";

export default async function NewPatientPage() {
  return (
    <main className="container mx-auto grid min-h-dvh max-w-2xl place-content-center px-4">
      <NewPatientForm />
    </main>
  );
}
