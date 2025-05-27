"use client";

import { Treatment } from "@/domain/entities/Treatment";
import { PatientRepository } from "@/domain/repositories/PatientRepository";
import { useDependencies } from "@/ioc/context/DependenciesProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { z } from "zod";
import useQueryGetPatientById from "../queries/useQueryGetPatientById";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { PlusIcon, TrashIcon } from "lucide-react";

const therapeuticActivitySchema = z.object({
  name: z.string().min(1, "Debe ingresar un nombre"),
  beginningHour: z.string().min(1, "Debe ingresar una hora"),
  endHour: z.string().min(1, "Debe ingresar una hora"),
  dayOfBlock: z.number().min(1, "Debe ingresar un día del bloque"),
});

const treatmentBlockSchema = z
  .object({
    beginningDate: z.string().min(1, "Debe ingresar una fecha"),
    durationDays: z.number().min(1, "La duración mínima es de 1 día"),
    iterations: z.number().min(1, "La cantidad mínima de iteraciones es de 1"),
    therapeuticActivities: z.array(therapeuticActivitySchema),
  })
  .superRefine((arg, ctx) => {
    arg.therapeuticActivities.forEach((value, index) => {
      if (value.dayOfBlock > arg.durationDays) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El día del bloque no puede superar la duración de un bloque de tratamiento",
          path: ["therapeuticActivities", index, "dayOfBlock"],
        });
      }
    });
  });

const treatmentSchema = z.object({
  eyeCondition: z.string().min(1, "Debe ingresar una condición ocular"),
  name: z.string().min(1, "Debe ingresar un nombre"),
  description: z.string().max(100, "Máximo 100 caracteres"),
  treatmentBlocks: z.array(treatmentBlockSchema),
});

export function NewTreatmentForm({ patientId }: { patientId: string }) {
  const emptyTreatment: Treatment = {
    id: "",
    eyeCondition: "",
    name: "",
    description: "",
    treatmentBlocks: [],
  };

  return (
    <PopulatedTreatmentForm
      treatment={emptyTreatment}
      onSubmit={async (data) => {
        console.log(data);
      }}
    />
  );
}

export function UpdateTreatmentForm({
  patientId,
  treatmentId,
}: {
  patientId: string;
  treatmentId: string;
}) {
  const getPatientQuery = useQueryGetPatientById(patientId);

  if (getPatientQuery.isLoading) return <div>Cargando Paciente...</div>;
  if (!getPatientQuery.data?.ok)
    return (
      <div>
        Error: {getPatientQuery.data?.errors[0].message ?? "Datos vacíos"}
      </div>
    );

  const patient = getPatientQuery.data.value;
  const treatment = patient.treatments.find((t) => t.id === treatmentId);

  if (!treatment) return <div>Treatment not found</div>;

  return (
    <PopulatedTreatmentForm treatment={treatment} onSubmit={async () => {}} />
  );
}

type PopulatedTreatmentFormProps = {
  treatment: Treatment;
  onSubmit: (data: z.infer<typeof treatmentSchema>) => Promise<void>;
};

function PopulatedTreatmentForm({
  treatment,
  onSubmit,
}: PopulatedTreatmentFormProps) {
  const form = useForm<z.infer<typeof treatmentSchema>>({
    defaultValues: {
      eyeCondition: treatment.eyeCondition,
      name: treatment.name,
      description: treatment.description,
      treatmentBlocks: treatment.treatmentBlocks,
    },
    resolver: zodResolver(treatmentSchema),
  });

  const treatmentBlocksArrayField = useFieldArray({
    control: form.control,
    name: "treatmentBlocks",
  });

  const { treatmentBlocks: observedTreatmentBlocks } = form.watch();

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="eyeCondition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Afección *</FormLabel>
              <FormDescription>Nombre de la afección a tratar</FormDescription>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tratamiento *</FormLabel>
              <FormDescription>
                Nombre del tratamiento a realizar
              </FormDescription>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción del tratamiento</FormLabel>
              <FormDescription>
                Descripción opcional y breve del tratamiento
              </FormDescription>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <fieldset className="mt-2 mb-4 grid">
          <legend className="float-left mb-2 text-xl font-bold uppercase">
            Bloques de tratamiento
          </legend>

          <Accordion
            type="multiple"
            defaultValue={Array.from({ length: 10 }).map((_, i) => i + "")}
          >
            {treatmentBlocksArrayField.fields.map((field, index) => {
              const therapeuticActivitiesArr =
                observedTreatmentBlocks[index].therapeuticActivities;
              const blockName = therapeuticActivitiesArr.reduce(
                (acc, val, index) =>
                  acc +
                  val.name +
                  (index < therapeuticActivitiesArr.length - 1 ? ", " : ""),
                "",
              );

              return (
                <AccordionItem value={index + ""} key={field.id}>
                  <AccordionTrigger>
                    {blockName.length > 0
                      ? blockName
                      : `Bloque de tratamiento ${index + 1}`}
                  </AccordionTrigger>
                  <AccordionContent className="mb-4 grid gap-4 md:px-12">
                    <FormField
                      control={form.control}
                      name={`treatmentBlocks.${index}.beginningDate`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormLabel>Fecha de inicio *</FormLabel>
                          <FormControl>
                            <Input className="w-fit" type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`treatmentBlocks.${index}.durationDays`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormLabel>Duración en días *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="w-fit"
                              {...field}
                              onChange={(e) => {
                                field.onChange(+e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`treatmentBlocks.${index}.iterations`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormLabel>Cantidad de iteraciones *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="w-fit"
                              {...field}
                              onChange={(e) => {
                                field.onChange(+e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <TherapeuticActivitiesFieldset
                      treatmentBlockIndex={index}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                treatmentBlocksArrayField.append({
                  beginningDate: new Date().toISOString().split("T")[0],
                  durationDays: 1,
                  iterations: 1,
                  therapeuticActivities: [],
                })
              }
            >
              Añadir Bloque de tratamiento
            </Button>
          </div>
        </fieldset>
        <Button>Submit</Button>
      </form>
    </FormProvider>
  );
}

function TherapeuticActivitiesFieldset({
  treatmentBlockIndex,
}: {
  treatmentBlockIndex: number;
}) {
  const form = useFormContext<z.infer<typeof treatmentSchema>>();

  const therapeuticActivitiesArrayField = useFieldArray({
    control: form.control,
    name: `treatmentBlocks.${treatmentBlockIndex}.therapeuticActivities`,
  });

  return (
    <fieldset className="mt-4 grid">
      <div className="mb-4 flex items-center justify-between">
        <legend className="float-left tracking-wider uppercase">
          Actividades terapéuticas
        </legend>
        <Button
          variant="secondary"
          type="button"
          onClick={() =>
            therapeuticActivitiesArrayField.append({
              name: "",
              dayOfBlock: 1,
              beginningHour: "09:00",
              endHour: "10:00",
            })
          }
        >
          <PlusIcon />
          <span className="sr-only">Añadir Actividad Terapéutica</span>
        </Button>
      </div>

      <div className="grid gap-2">
        <div className="border-muted grid grid-cols-[3fr_1fr_2fr_2fr_20px] gap-1 border-t border-b py-4 text-xs md:px-4 md:*:pl-4">
          <span>Nombre</span>
          <span>Día</span>
          <span>Hora de inicio</span>
          <span>Hora de fin</span>
        </div>

        {therapeuticActivitiesArrayField.fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[3fr_1fr_2fr_2fr_20px] gap-1 md:px-4 [&_input]:!text-xs"
          >
            <FormField
              control={form.control}
              name={`treatmentBlocks.${treatmentBlockIndex}.therapeuticActivities.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">
                    Nombre de la Actividad *
                  </FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`treatmentBlocks.${treatmentBlockIndex}.therapeuticActivities.${index}.dayOfBlock`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Día del bloque *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(+e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`treatmentBlocks.${treatmentBlockIndex}.therapeuticActivities.${index}.beginningHour`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Hora inicio *</FormLabel>
                  <FormControl>
                    <Input className="!text-xs" type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`treatmentBlocks.${treatmentBlockIndex}.therapeuticActivities.${index}.endHour`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Hora fin *</FormLabel>
                  <FormControl>
                    <Input className="!text-xs" type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              variant="ghost"
              type="button"
              className="mt-1 h-fit min-w-0 p-[5px]"
              onClick={() => therapeuticActivitiesArrayField.remove(index)}
            >
              <TrashIcon />
            </Button>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
