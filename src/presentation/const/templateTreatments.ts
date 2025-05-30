import { Treatment } from "@/domain/entities/Treatment";

export const templateTreatments: { [key: string]: Treatment[] } = {
  estrabismo: [
    {
      id: "",
      eyeCondition: "Estrabismo",
      name: "Ejercicios ortópticos",
      description:
        "Especialmente útiles en exotropía intermitente; deben ser indicados por especialista.",
      treatmentBlocks: [
        {
          beginningDate: new Date(),
          durationDays: 7,
          iterations: 365,
          therapeuticActivities: [
            {
              name: "Ejercicio ortóptico",
              dayOfBlock: 1,
              beginningHour: "18:00",
              endHour: "18:15",
            },
            {
              name: "Ejercicio ortóptico",
              dayOfBlock: 2,
              beginningHour: "18:00",
              endHour: "18:15",
            },
            {
              name: "Ejercicio ortóptico",
              dayOfBlock: 3,
              beginningHour: "18:00",
              endHour: "18:15",
            },
            {
              name: "Ejercicio ortóptico",
              dayOfBlock: 4,
              beginningHour: "18:00",
              endHour: "18:15",
            },
            {
              name: "Ejercicio ortóptico",
              dayOfBlock: 5,
              beginningHour: "18:00",
              endHour: "18:15",
            },
          ],
        },
      ],
    },
  ],
  ambliopía: [
    {
      id: "",
      eyeCondition: "Ambliopía",
      name: "Oclusión",
      description:
        "Aplicar Parche en ojo sano. Tratamiento estándar; necesita control profesional para evitar ambliopía inversa.",
      treatmentBlocks: [
        {
          beginningDate: new Date(),
          durationDays: 1,
          iterations: 365,
          therapeuticActivities: [
            {
              name: "Aplicar parche en ojo sano",
              dayOfBlock: 1,
              beginningHour: "18:00",
              endHour: "20:00",
            },
          ],
        },
      ],
    },
    {
      id: "",
      eyeCondition: "Ambliopía",
      name: "Atropina",
      description:
        "Tan eficaz como la oclusión en casos moderados. Mejor adherencia.",
      treatmentBlocks: [
        {
          beginningDate: new Date(),
          durationDays: 1,
          iterations: 365,
          therapeuticActivities: [
            {
              name: "Ejercicio ortóptico",
              dayOfBlock: 1,
              beginningHour: "18:00",
              endHour: "18:00",
            },
          ],
        },
      ],
    },
  ],
};
