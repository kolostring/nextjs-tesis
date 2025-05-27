import PatientsList from "@/presentation/components/PatientsList";

export default async function Page() {
  return (
    <main className="container mx-auto max-w-2xl px-4">
      <PatientsList />
    </main>
  );
}
