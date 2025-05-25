'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TreatmentRepository } from '@/domain/repositories/TreatmentRepository';
import { useDependencies } from '@/ioc/context/DependenciesProvider';
import { createTreatmentSchema, CreateTreatmentFormData } from '@/presentation/schemas/CreateTreatmentSchema';
import { infrastructureQueryKeys } from '@/infrastructure/consts/InfrastructureQueryKeys';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AddTreatmentFormProps {
  patientId: string;
}

export function AddTreatmentForm({ patientId }: AddTreatmentFormProps) {
  const { getContainer } = useDependencies();
  const repo = getContainer().resolve(TreatmentRepository);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string>("");

  const mutation = useMutation({
    mutationFn: (data: CreateTreatmentFormData) =>
      repo.createTreatment({
        ...data,
        patientId,
      }),
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({
          queryKey: infrastructureQueryKeys.treatments.byPatient(patientId).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: ['treatments', 'byPatient', patientId],
        });
        setSuccessMessage(`Tratamiento "${result.value.name}" creado exitosamente!`);
        reset();
        setTimeout(() => {
          setSuccessMessage("");
          router.push('/');
        }, 2000);
      }
    },
    onError: (error) => {
      setSuccessMessage("");
      console.error('Error creating treatment:', error);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTreatmentFormData>({
    resolver: zodResolver(createTreatmentSchema),
  });

  const onSubmit = (data: CreateTreatmentFormData) => {
    setSuccessMessage("");
    mutation.mutate(data);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {mutation.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {mutation.error.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Condición Ocular */}
        <div>
          <label htmlFor="eyeCondition" className="block text-sm font-medium text-gray-700 mb-1">
            Condición Ocular *
          </label>
          <input
            type="text"
            id="eyeCondition"
            {...register("eyeCondition")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ej: Miopía, Hipermetropía, Astigmatismo"
          />
          {errors.eyeCondition && (
            <p className="text-red-500 text-sm mt-1">{errors.eyeCondition.message}</p>
          )}
        </div>

        {/* Nombre del Tratamiento */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Tratamiento *
          </label>
          <input
            type="text"
            id="name"
            {...register("name")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ej: Corrección con lentes, Terapia visual"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            {...register("description")}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
            placeholder="Describe los detalles del tratamiento..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 bg-primary text-primary-foreground font-medium py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? "Guardando..." : "Guardar Tratamiento"}
          </button>
          
          <button
            type="button"
            onClick={() => router.push(`/patients/${patientId}`)}
            className="flex-1 bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
} 