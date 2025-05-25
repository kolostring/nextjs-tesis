import { z } from "zod";

export const createPatientSchema = z.object({
  fullName: z
    .string()
    .min(1, "El nombre completo es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  
  dateOfBirth: z
    .date()
    .optional()
    .refine(
      (date) => !date || date <= new Date(),
      "La fecha de nacimiento no puede ser futura"
    ),
    
  description: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type CreatePatientFormData = z.infer<typeof createPatientSchema>; 