import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { AddTreatmentForm } from './AddTreatmentForm';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewTreatmentPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Añadir Nuevo Tratamiento</h1>
          <p className="text-gray-600 mt-2">Registra un nuevo tratamiento para el paciente.</p>
        </div>
        <AddTreatmentForm patientId={id} />
      </div>
    </div>
  );
} 