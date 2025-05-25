'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '@/ioc/context/DependenciesProvider';
import { PatientRepository } from '@/domain/repositories/PatientRepository';
import { TreatmentRepository } from '@/domain/repositories/TreatmentRepository';
import { createClient } from '@/utils/supabase/client';
import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

export function TreatmentManagement() {
  const { getContainer } = useDependencies();
  const patientRepository = getContainer().resolve(PatientRepository);
  const treatmentRepository = getContainer().resolve(TreatmentRepository);
  const [user, setUser] = useState<User | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase.auth]);

  const patientsQuery = useQuery({
    queryKey: ['patients', 'byUser', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return patientRepository.getPatientsByUser(user.id);
    },
    enabled: !!user?.id,
  });

  const treatmentsQuery = useQuery({
    queryKey: ['treatments', 'byPatient', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return { ok: true, value: [] };
      return treatmentRepository.listByPatient(selectedPatientId);
    },
    enabled: !!selectedPatientId,
  });

  const patients = patientsQuery.data?.ok ? patientsQuery.data.value : [];
  const treatments = treatmentsQuery.data?.ok ? treatmentsQuery.data.value : [];

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Gestión de Tratamientos
        </h2>
        <p className="text-gray-600">Debes iniciar sesión para gestionar tratamientos.</p>
        <Link
          href="/login"
          className="mt-4 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Gestión de Tratamientos
        </h2>
        <Link
          href="/treatments/create"
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm"
        >
          + Nuevo Bloque de Tratamiento
        </Link>
      </div>

      {/* Selector de Paciente */}
      <div className="mb-6">
        <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Paciente:
        </label>
        <select
          id="patient-select"
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Selecciona un paciente...</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.fullName}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Tratamientos */}
      {selectedPatientId ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">
            Tratamientos Activos ({treatments.length})
          </h3>
          
          {treatmentsQuery.isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : treatments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No hay tratamientos activos para este paciente.</p>
              <Link
                href={`/patients/${selectedPatientId}/treatments/new`}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              >
                Crear Primer Tratamiento
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {treatments.map((treatment) => (
                <TreatmentCard key={treatment.id} treatment={treatment} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Selecciona un paciente para ver sus tratamientos.</p>
        </div>
      )}
    </div>
  );
}

interface TreatmentCardProps {
  treatment: {
    id: string;
    name: string;
    eyeCondition: string;
    description?: string;
    createdAt?: Date;
  };
}

function TreatmentCard({ treatment }: TreatmentCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {treatment.name}
          </h4>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Afección Ocular:</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {treatment.eyeCondition}
              </span>
            </div>
            
            {treatment.description && (
              <div>
                <span className="font-medium">Descripción:</span>
                <p className="text-gray-700 mt-1">{treatment.description}</p>
              </div>
            )}
            
            {treatment.createdAt && (
              <div>
                <span className="font-medium">Creado:</span>
                <span className="ml-2">{treatment.createdAt.toLocaleDateString('es-ES')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          <button
            onClick={() => {
              // TODO: Implementar gestión de bloques de tratamiento
              console.log('Gestionar bloques:', treatment.id);
            }}
            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
          >
            Gestionar Bloques
          </button>
          
          <button
            onClick={() => {
              // TODO: Implementar sistema de notas
              console.log('Ver notas:', treatment.id);
            }}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition-colors"
          >
            Notas
          </button>
          
          <button
            onClick={() => {
              // TODO: Implementar recordatorios
              console.log('Ver recordatorios:', treatment.id);
            }}
            className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600 transition-colors"
          >
            Recordatorios
          </button>
        </div>
      </div>
    </div>
  );
} 