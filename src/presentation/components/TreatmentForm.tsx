"use client";

import { Treatment } from "@/domain/entities/Treatment";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "./ui/dialog";
import Link from "next/link";
import Spinner from "./ui/spinner";
import useMutationAddTreatment from "../mutations/useMutationAddTreatment";
import useMutationUpdateTreatment from "../mutations/useMutationUpdateTreatment";

const therapeuticActivitySchema = z.object({
  name: z.string().min(1, "Debe ingresar un nombre"),
  beginningHour: z.string().min(1, "Debe ingresar una hora"),
  endHour: z.string().min(1, "Debe ingresar una hora"),
  dayOfBlock: z.number().min(1, "Debe ingresar un día del bloque"),
});

const treatmentBlockSchema = z
  .object({
    beginningDate: z.date(),
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
  const addTreatmentMutation = useMutationAddTreatment();
  const router = useRouter();

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
        const res = await addTreatmentMutation.mutateAsync({
          patientID: patientId,
          req: data as Treatment,
        });
        if (res.ok) {
          router.push(`/`);
        } else {
          console.log(res);
          toast.error(
            "Error al añadir tratamiento: " +
              res.errors.map((e) => e.message).join(", "),
          );
        }
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
  const updateTreatmentMutation = useMutationUpdateTreatment();
  const router = useRouter();

  if (getPatientQuery.isLoading) return <div>Cargando Paciente...</div>;
  if (getPatientQuery.isError || !getPatientQuery.data)
    return <div>Error: {getPatientQuery.error?.message ?? "Datos vacíos"}</div>;

  const patient = getPatientQuery.data;
  const treatment = patient.treatments.find((t) => t.id === treatmentId);

  if (!treatment) return <div>Treatment not found</div>;

  return (
    <PopulatedTreatmentForm
      treatment={treatment}
      onSubmit={async (data) => {
        const res = await updateTreatmentMutation.mutateAsync({
          patientID: patientId,
          req: {
            ...getPatientQuery.data.treatments.find(
              (t) => t.id === treatmentId,
            ),
            ...data,
          },
        });
        if (res.ok) {
          router.push(`/`);
        } else {
          console.log(res);
          toast.error(
            "Error al actualizar el tratamiento: " +
              res.errors.map((e) => e.message).join(", "),
          );
        }
      }}
    />
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
          <div className="mb-8 flex items-center justify-between">
            <legend className="float-left mb-2 text-2xl font-bold uppercase">
              Bloques de tratamiento
            </legend>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                treatmentBlocksArrayField.append({
                  beginningDate: new Date(),
                  durationDays: 1,
                  iterations: 1,
                  therapeuticActivities: [],
                })
              }
            >
              Añadir Bloque
            </Button>
          </div>

          <Accordion
            type="multiple"
            defaultValue={Array.from({ length: 10 }).map((_, i) => i + "")}
          >
            {treatmentBlocksArrayField.fields.length === 0 && (
              <div className="grid place-items-center gap-4 text-center">
                <p className="max-w-[40ch] text-pretty">
                  No hay bloques de tratamiento registrados.
                </p>
                <Button
                  type="button"
                  onClick={() =>
                    treatmentBlocksArrayField.append({
                      beginningDate: new Date(),
                      durationDays: 1,
                      iterations: 1,
                      therapeuticActivities: [],
                    })
                  }
                >
                  <span>Registrar Bloque de Tratamiento</span>
                </Button>
              </div>
            )}

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
                <AccordionItem
                  value={index + ""}
                  key={field.id}
                  className="bg-card mb-8 rounded-xl px-4"
                >
                  <AccordionTrigger className="text-xl uppercase">
                    {blockName.length > 0
                      ? blockName
                      : `Bloque de tratamiento ${index + 1}`}
                  </AccordionTrigger>
                  <AccordionContent className="grid gap-4 py-8 md:px-8">
                    <FormField
                      control={form.control}
                      name={`treatmentBlocks.${index}.beginningDate`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormLabel>Fecha de inicio *</FormLabel>
                          <FormControl>
                            <Input
                              className="w-fit"
                              type="date"
                              {...field}
                              value={field.value?.toISOString().split("T")[0]}
                              onChange={(e) => {
                                field.onChange(new Date(e.target.value));
                              }}
                            />
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

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          type="button"
                          className="mt-4 ml-auto"
                        >
                          Eliminar Bloque de tratamiento
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Eliminar bloque de tratamiento
                          </DialogTitle>
                          <DialogDescription>
                            ¿Estás seguro que quieres eliminar este bloque de
                            tratamiento?
                          </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                              treatmentBlocksArrayField.remove(index);
                            }}
                          >
                            Eliminar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </fieldset>
        <div className="flex justify-end gap-4">
          <Button asChild variant="ghost">
            <Link href="/">Cancelar</Link>
          </Button>
          <Button>
            {form.formState.isSubmitting ? <Spinner /> : "Guardar"}
          </Button>
        </div>
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
    <fieldset className="mt-8 grid">
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

      <div className="grid gap-8 md:gap-2">
        <div className="border-muted hidden grid-cols-[3fr_1fr_2fr_2fr_20px] gap-1 border-t border-b py-4 text-xs md:grid md:px-4 md:*:pl-4">
          <span>Nombre</span>
          <span>Día</span>
          <span>Hora inicio</span>
          <span>Hora fin</span>
        </div>

        {therapeuticActivitiesArrayField.fields.length === 0 && (
          <div className="grid place-items-center gap-4 text-center">
            <p className="max-w-[40ch] text-pretty">
              No hay actividades registradas.
            </p>
            <Button
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
              Añadir Actividad
            </Button>
          </div>
        )}

        {therapeuticActivitiesArrayField.fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-6 gap-2 md:grid-cols-[3fr_1fr_2fr_2fr_20px] md:gap-1 md:px-4 [&_input]:!text-xs"
          >
            <FormField
              control={form.control}
              name={`treatmentBlocks.${treatmentBlockIndex}.therapeuticActivities.${index}.name`}
              render={({ field }) => (
                <FormItem className="col-span-5 md:col-span-1">
                  <FormLabel className="md:sr-only">
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
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel className="md:sr-only">Día bloque *</FormLabel>
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
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel className="md:sr-only">Hora inicio *</FormLabel>
                  <FormControl>
                    <Input
                      className="text-center !text-xs"
                      type="time"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`treatmentBlocks.${treatmentBlockIndex}.therapeuticActivities.${index}.endHour`}
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel className="md:sr-only">Hora fin *</FormLabel>
                  <FormControl>
                    <Input
                      className="text-center !text-xs"
                      type="time"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              variant="ghost"
              type="button"
              className="col-start-6 row-start-1 mt-1 self-end p-[5px] md:col-start-auto md:row-start-auto md:mt-0 md:max-w-0 md:self-start"
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
