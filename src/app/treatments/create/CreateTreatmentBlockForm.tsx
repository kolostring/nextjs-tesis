'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDependencies } from '@/ioc/context/DependenciesProvider';
import { PatientRepository } from '@/domain/repositories/PatientRepository';
import { TreatmentRepository } from '@/domain/repositories/TreatmentRepository';
import { TreatmentBlockRepository } from '@/domain/repositories/TreatmentBlockRepository';
import { TherapeuticActivityRepository } from '@/domain/repositories/TherapeuticActivityRepository';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

// Schema para actividades terapéuticas
const therapeuticActivitySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  dayOfBlock: z.number().min(1, 'Debe ser mayor a 0'),
  beginningHour: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:mm'),
  endHour: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:mm'),
});

// Schema para el bloque de tratamiento
const treatmentBlockSchema = z.object({
  treatmentId: z.string().min(1, 'Debe seleccionar un tratamiento'),
  beginningDate: z.date({ required_error: 'La fecha de inicio es requerida' }),
  durationDays: z.number().min(1, 'Debe ser al menos 1 día').max(365, 'Máximo 365 días'),
  iterations: z.number().min(1, 'Debe ser al menos 1 iteración').max(100, 'Máximo 100 iteraciones'),
  activities: z.array(therapeuticActivitySchema).min(1, 'Debe tener al menos una actividad'),
});

type TreatmentBlockFormData = z.infer<typeof treatmentBlockSchema>;

interface CreateTreatmentBlockFormProps {
  userId: string;
}

export function CreateTreatmentBlockForm({ userId }: CreateTreatmentBlockFormProps) {
  const { getContainer } = useDependencies();
  const patientRepository = getContainer().resolve(PatientRepository);
  const treatmentRepository = getContainer().resolve(TreatmentRepository);
  const treatmentBlockRepository = getContainer().resolve(TreatmentBlockRepository);
  const therapeuticActivityRepository = getContainer().resolve(TherapeuticActivityRepository);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<TreatmentBlockFormData>({
    resolver: zodResolver(treatmentBlockSchema),
    defaultValues: {
      activities: [{
        name: '',
        description: '',
        dayOfBlock: 1,
        beginningHour: '09:00',
        endHour: '10:00',
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'activities',
  });

  // Query para obtener pacientes del usuario
  const patientsQuery = useQuery({
    queryKey: ['patients', 'byUser', userId],
    queryFn: async () => {
      return patientRepository.getPatientsByUser(userId);
    },
  });

  // Query para obtener tratamientos del paciente seleccionado
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

  const createBlockMutation = useMutation({
    mutationFn: async (data: TreatmentBlockFormData) => {
      // Crear el bloque de tratamiento
      const blockResult = await treatmentBlockRepository.createTreatmentBlock({
        treatmentId: data.treatmentId,
        beginningDate: data.beginningDate,
        durationDays: data.durationDays,
        iterations: data.iterations,
      });

      if (!blockResult.ok) {
        throw new Error(blockResult.errors[0]?.message || 'Error al crear bloque de tratamiento');
      }

      const treatmentBlock = blockResult.value;

      // Crear todas las actividades terapéuticas
      const activityPromises = data.activities.map(activity =>
        therapeuticActivityRepository.createActivity({
          treatmentBlockId: treatmentBlock.id,
          name: activity.name,
          description: activity.description || undefined,
          dayOfBlock: activity.dayOfBlock,
          beginningHour: activity.beginningHour,
          endHour: activity.endHour,
        })
      );

      const activityResults = await Promise.all(activityPromises);
      
      // Verificar que todas las actividades se crearon correctamente
      const failedActivities = activityResults.filter(result => !result.ok);
      if (failedActivities.length > 0) {
        // Si algunas actividades fallaron, eliminar el bloque creado
        await treatmentBlockRepository.delete(treatmentBlock.id);
        throw new Error(`Error al crear ${failedActivities.length} actividades terapéuticas`);
      }

      return {
        treatmentBlock,
        activities: activityResults.map(result => result.ok ? result.value : null).filter(Boolean),
      };
    },
    onSuccess: (result) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ['treatments', 'byPatient', selectedPatientId],
      });
      queryClient.invalidateQueries({
        queryKey: ['treatmentBlocks'],
      });
      
      setSuccessMessage(
        `Bloque de tratamiento "${result.treatmentBlock.treatmentId}" creado exitosamente con ${result.activities.length} actividades!`
      );
      reset();
      setTimeout(() => {
        setSuccessMessage('');
        router.push('/');
      }, 3000);
    },
    onError: (error) => {
      setSuccessMessage('');
      console.error('Error creating treatment block:', error);
    },
  });

  const onSubmit = (data: TreatmentBlockFormData) => {
    setSuccessMessage('');
    createBlockMutation.mutate(data);
  };

  const durationDays = watch('durationDays') || 1;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {createBlockMutation.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {createBlockMutation.error.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Selección de Paciente */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paciente *
            </label>
            <select
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

          {/* Selección de Tratamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tratamiento *
            </label>
            <select
              {...register('treatmentId')}
              disabled={!selectedPatientId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Selecciona un tratamiento...</option>
              {treatments.map((treatment) => (
                <option key={treatment.id} value={treatment.id}>
                  {treatment.name} - {treatment.eyeCondition}
                </option>
              ))}
            </select>
            {errors.treatmentId && (
              <p className="text-red-500 text-sm mt-1">{errors.treatmentId.message}</p>
            )}
          </div>
        </div>

        {/* Configuración del Bloque */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              {...register('beginningDate', { valueAsDate: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.beginningDate && (
              <p className="text-red-500 text-sm mt-1">{errors.beginningDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración (días) *
            </label>
            <input
              type="number"
              min="1"
              max="365"
              {...register('durationDays', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.durationDays && (
              <p className="text-red-500 text-sm mt-1">{errors.durationDays.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Iteraciones *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              {...register('iterations', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.iterations && (
              <p className="text-red-500 text-sm mt-1">{errors.iterations.message}</p>
            )}
          </div>
        </div>

        {/* Actividades Terapéuticas */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Actividades Terapéuticas
            </h3>
            <button
              type="button"
              onClick={() => append({
                name: '',
                description: '',
                dayOfBlock: 1,
                beginningHour: '09:00',
                endHour: '10:00',
              })}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
            >
              + Agregar Actividad
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-800">
                    Actividad {index + 1}
                  </h4>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Actividad *
                    </label>
                    <input
                      type="text"
                      {...register(`activities.${index}.name`)}
                      placeholder="Ej: Parche ojo izquierdo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {errors.activities?.[index]?.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.activities[index]?.name?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Día del Bloque *
                    </label>
                    <select
                      {...register(`activities.${index}.dayOfBlock`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {Array.from({ length: durationDays }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Día {i + 1}
                        </option>
                      ))}
                    </select>
                    {errors.activities?.[index]?.dayOfBlock && (
                      <p className="text-red-500 text-sm mt-1">{errors.activities[index]?.dayOfBlock?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de Inicio *
                    </label>
                    <input
                      type="time"
                      {...register(`activities.${index}.beginningHour`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {errors.activities?.[index]?.beginningHour && (
                      <p className="text-red-500 text-sm mt-1">{errors.activities[index]?.beginningHour?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de Fin *
                    </label>
                    <input
                      type="time"
                      {...register(`activities.${index}.endHour`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {errors.activities?.[index]?.endHour && (
                      <p className="text-red-500 text-sm mt-1">{errors.activities[index]?.endHour?.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      {...register(`activities.${index}.description`)}
                      rows={2}
                      placeholder="Descripción detallada de la actividad..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                    />
                    {errors.activities?.[index]?.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.activities[index]?.description?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createBlockMutation.isPending}
            className="flex-1 bg-primary text-primary-foreground font-medium py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createBlockMutation.isPending ? 'Creando...' : 'Crear Bloque de Tratamiento'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
} 