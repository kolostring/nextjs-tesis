'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema para notas
const noteSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NotesManagerProps {
  patientId: string;
  patientName: string;
  userId: string;
}

export function NotesManager({ patientId, patientName, userId }: NotesManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
  });

  // TODO: Implementar query para obtener notas del paciente
  // const notesQuery = useQuery({
  //   queryKey: ['notes', 'byPatient', patientId],
  //   queryFn: async () => {
  //     // Implementar cuando tengamos el repositorio de notas
  //     return { ok: true, value: [] };
  //   },
  // });

  // TODO: Implementar mutación para crear nota
  const createNoteMutation = useMutation({
    mutationFn: async (data: NoteFormData) => {
      // TODO: Implementar creación de notas cuando tengamos el repositorio
      console.log('Crear nota:', data, { patientId, userId });
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      setSuccessMessage('Nota creada exitosamente!');
      reset();
      setIsFormOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: () => {
      setSuccessMessage('');
    },
  });

  const onSubmit = (data: NoteFormData) => {
    setSuccessMessage('');
    createNoteMutation.mutate(data);
  };

  // Datos simulados para mostrar el componente
  const mockNotes = [
    {
      id: '1',
      title: 'Primera sesión',
      description: 'El paciente se mostró colaborativo durante la primera sesión. Respondió bien al parche en el ojo izquierdo.',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Progreso semana 2',
      description: 'Se observa mejora en la fijación. El paciente tolera mejor los ejercicios de seguimiento.',
      createdAt: new Date('2024-01-22'),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Notas de Seguimiento - {patientName}
        </h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors text-sm"
        >
          {isFormOpen ? 'Cancelar' : '+ Nueva Nota'}
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Formulario para crear nota */}
      {isFormOpen && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Nueva Nota</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                id="title"
                {...register('title')}
                placeholder="Ej: Progreso semana 1, Observaciones generales..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                placeholder="Describe observaciones, evolución del tratamiento, respuesta del paciente..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-vertical"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createNoteMutation.isPending}
                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createNoteMutation.isPending ? 'Guardando...' : 'Guardar Nota'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  reset();
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de notas */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">
          Historial de Notas ({mockNotes.length})
        </h3>
        
        {mockNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No hay notas registradas para este paciente.</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
            >
              Crear Primera Nota
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {mockNotes.map((note) => (
              <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{note.title}</h4>
                  <span className="text-sm text-gray-500">
                    {note.createdAt.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                {note.description && (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {note.description}
                  </p>
                )}

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      // TODO: Implementar edición de notas
                      console.log('Editar nota:', note.id);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implementar eliminación de notas
                      console.log('Eliminar nota:', note.id);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 