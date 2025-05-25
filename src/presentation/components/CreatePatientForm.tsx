"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDependencies } from "@/ioc/context/DependenciesProvider";
import { PatientRepository } from "@/domain/repositories/PatientRepository";
import { createPatientSchema, CreatePatientFormData } from "../schemas/CreatePatientSchema";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function CreatePatientForm() {
  const { getContainer } = useDependencies();
  const patientRepository = getContainer().resolve(PatientRepository);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [user, setUser] = useState<{ id: string } | null>(null);
  const supabase = createClient();

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase.auth]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePatientFormData>({
    resolver: zodResolver(createPatientSchema),
  });

  const createPatientMutation = useMutation({
    mutationFn: async (data: CreatePatientFormData) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const result = await patientRepository.createPatient({
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        description: data.description || undefined,
      }, user.id);

      if (!result.ok) {
        throw new Error(result.errors[0]?.message || "Error al crear el paciente");
      }

      return result.value;
    },
    onSuccess: (patient) => {
      // Invalidate the patient list cache so it refreshes
      queryClient.invalidateQueries({
        queryKey: ['patients', 'byUser', user?.id],
      });
      
      setSuccessMessage(`Paciente "${patient.fullName}" creado exitosamente!`);
      reset();
      setTimeout(() => {
        setSuccessMessage("");
        router.push('/');
      }, 2000);
    },
    onError: () => {
      setSuccessMessage("");
    },
  });

  const onSubmit = (data: CreatePatientFormData) => {
    setSuccessMessage("");
    createPatientMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <p className="text-center text-gray-600">
          Debes iniciar sesión para crear pacientes.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nuevo Paciente</h2>
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {createPatientMutation.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {createPatientMutation.error.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombre Completo */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="fullName"
            {...register("fullName")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ingrese el nombre completo"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            id="dateOfBirth"
            {...register("dateOfBirth", {
              valueAsDate: true,
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.dateOfBirth && (
            <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
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
            placeholder="Ingrese una descripción opcional del paciente"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={createPatientMutation.isPending}
          className="w-full bg-primary text-primary-foreground font-medium py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {createPatientMutation.isPending ? "Creando..." : "Crear Paciente"}
        </button>
      </form>
    </div>
  );
} 