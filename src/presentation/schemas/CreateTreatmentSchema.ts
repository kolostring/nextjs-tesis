import { z } from "zod";

export const createTreatmentSchema = z.object({
  eyeCondition: z
    .string()
    .min(1, "La condición ocular es requerida")
    .min(2, "La condición debe tener al menos 2 caracteres")
    .max(100, "La condición no puede exceder 100 caracteres"),
  
  name: z
    .string()
    .min(1, "El nombre del tratamiento es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
    
  description: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type CreateTreatmentFormData = z.infer<typeof createTreatmentSchema>; 