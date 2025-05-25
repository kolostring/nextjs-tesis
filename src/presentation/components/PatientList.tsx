'use client';

import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '@/ioc/context/DependenciesProvider';
import { PatientRepository } from '@/domain/repositories/PatientRepository';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

export function PatientList() {
  const { getContainer } = useDependencies();
  const patientRepository = getContainer().resolve(PatientRepository);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const userId = user?.id;

  const patientsQuery = useQuery({
    queryKey: ['patients', 'byUser', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }
      return patientRepository.getPatientsByUser(userId);
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Mis Pacientes
        </h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Mis Pacientes
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Debes iniciar sesión para ver tus pacientes.
          </p>
          <Link
            href="/login"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (patientsQuery.isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Mis Pacientes
        </h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (patientsQuery.error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Mis Pacientes
        </h2>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">
            Error al cargar los pacientes: {patientsQuery.error.message}
          </p>
          <button
            onClick={() => patientsQuery.refetch()}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!patientsQuery.data?.ok) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Mis Pacientes
        </h2>
        <div className="text-center py-8">
          <p className="text-red-600">
            Error al obtener los pacientes.
          </p>
        </div>
      </div>
    );
  }

  const patients = patientsQuery.data.value;

  if (patients.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Mis Pacientes
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Aún no tienes pacientes registrados.
          </p>
          <Link
            href="/crear-paciente"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Crear Primer Paciente
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Mis Pacientes ({patients.length})
        </h2>
        <Link
          href="/crear-paciente"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm"
        >
          + Nuevo Paciente
        </Link>
      </div>

      <div className="space-y-4">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {patient.fullName}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  {patient.dateOfBirth && (
                    <div>
                      <span className="font-medium">Fecha de Nacimiento:</span>
                      <p>{patient.dateOfBirth.toLocaleDateString('es-ES')}</p>
                    </div>
                  )}
                  
                  {patient.createdAt && (
                    <div>
                      <span className="font-medium">Registrado:</span>
                      <p>{patient.createdAt.toLocaleDateString('es-ES')}</p>
                    </div>
                  )}
                </div>

                {patient.description && (
                  <div className="mt-3">
                    <span className="font-medium text-sm text-gray-600">Descripción:</span>
                    <p className="text-gray-700 mt-1">{patient.description}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <Link
                  href={`/patients/${patient.id}/treatments/new`}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors text-center"
                >
                  + Tratamiento
                </Link>
                
                <button
                  onClick={() => {
                    // TODO: Implementar ver detalles del paciente
                    console.log('Ver detalles:', patient.id);
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => patientsQuery.refetch()}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          🔄 Actualizar lista
        </button>
      </div>
    </div>
  );
} 