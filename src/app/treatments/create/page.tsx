import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { CreateTreatmentBlockForm } from './CreateTreatmentBlockForm';
import Link from 'next/link';

export default async function CreateTreatmentBlockPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header con botón volver */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Crear Bloque de Tratamiento</h1>
          <p className="text-gray-600 mt-2">
            Define una secuencia ordenada y repetible de actividades terapéuticas para un tratamiento oftalmológico.
          </p>
        </div>
        
        <CreateTreatmentBlockForm userId={user.id} />
      </div>
    </div>
  );
} 