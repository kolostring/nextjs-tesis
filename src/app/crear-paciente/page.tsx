import { CreatePatientForm } from "@/presentation/components";
import Link from "next/link";

export default function CreatePatientPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Header con botón volver */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              ← Volver al inicio
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Crear Nuevo Paciente</h1>
            <p className="text-gray-600 mt-1">Registra la información básica del paciente</p>
          </div>
          
          <CreatePatientForm />
        </div>
      </div>
    </div>
  );
} 