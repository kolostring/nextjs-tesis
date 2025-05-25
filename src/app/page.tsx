import Test from "@/components/Test";
import Link from "next/link";
import { createClient } from '@/utils/supabase/server';
import { Header } from '@/presentation/components/Header';
import { PatientList, TreatmentManagement } from '@/presentation/components';
import { SupabaseTest } from '@/components/SupabaseTest';

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Welcome Section */}
            {user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  ¡Bienvenido de vuelta!
                </h3>
                <p className="text-blue-700">
                  Estás autenticado como {user.email || 'Usuario'}. Gestiona tus pacientes y tratamientos desde aquí.
                </p>
              </div>
            )}

            {/* Supabase Test */}
            <div className="mb-8">
              <SupabaseTest />
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Link
                href="/crear-paciente"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Crear Nuevo Paciente
                </h2>
                <p className="text-gray-600">
                  Registra un nuevo paciente en el sistema con su información básica.
                </p>
              </Link>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Afecciones Oculares
                </h2>
                <p className="text-gray-600">
                  Gestiona afecciones como ambliopía, estrabismo y crea nuevas condiciones personalizadas.
                </p>
              </div>
            </div>

            {/* Patient List */}
            <div className="mb-8">
              <PatientList />
            </div>

            {/* Treatment Management */}
            <div className="mb-8">
              <TreatmentManagement />
            </div>

            {/* Test Component */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Componente de Prueba
              </h2>
              <Test />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
