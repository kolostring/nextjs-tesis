"use client";

import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";
import { isAfter, isValid, parse } from "date-fns";
import { toast } from "sonner";
import Spinner from "./ui/spinner";
import { Patient } from "@/domain/entities/Patient";
import { StrictPick } from "@/common/types/StrictPick";
import useMutationCreatePatient from "../mutations/useMutationCreatePatient";
import useMutationUpdatePatient from "../mutations/useMutationUpdatePatient";
import useQueryGetPatientById from "../queries/useQueryGetPatientById";
import Link from "next/link";

const newPatientSchema = z.object({
  fullName: z
    .string()
    .min(1, "Debe ingresar un nombre")
    .max(100, "Máximo 100 caracteres"),
  description: z.string().max(100, "Máximo 100 caracteres"),
  dateOfBirth: z
    .string()
    .min(1, "Debe ingresar una fecha")
    .superRefine((arg, ctx) => {
      const parsedDate = parse(arg, "yyyy-MM-dd", new Date());

      if (!isValid(parsedDate)) {
        ctx.addIssue({
          code: "custom",
          message: "La fecha no es válida",
        });
      } else if (isAfter(parsedDate, new Date())) {
        ctx.addIssue({
          code: "custom",
          message: "La fecha no puede ser posterior a la fecha actual",
        });
      }
    }),
});

export function NewPatientForm() {
  const createPatientMutation = useMutationCreatePatient();

  const router = useRouter();

  return (
    <PatientForm
      patient={{
        fullName: "",
        dateOfBirth: new Date(),
        description: "",
      }}
      onSubmit={async (data: z.infer<typeof newPatientSchema>) => {
        const res = await createPatientMutation.mutateAsync({
          fullName: data.fullName,
          description: data.description,
          dateOfBirth: parse(data.dateOfBirth, "yyyy-MM-dd", new Date()),
        });

        if (res.ok) {
          router.push("/");
          toast("paciente creado exitosamente!");
        } else {
          toast.error("Error al crear el paciente: ", {
            description: res.errors.map((e) => e.message).join(", "),
          });
        }
      }}
    />
  );
}

type UpdatePatientFormProps = {
  patientID: string;
};

export function UpdatePatientForm({ patientID }: UpdatePatientFormProps) {
  const getPatientQuery = useQueryGetPatientById(patientID);
  const updatePatientMutation = useMutationUpdatePatient();
  const router = useRouter();

  if (getPatientQuery.isLoading) return <div>Cargando paciente...</div>;
  if (getPatientQuery.isError || !getPatientQuery.data)
    return <div>Error: {getPatientQuery.error?.message ?? "Datos vacíos"}</div>;

  return (
    <PatientForm
      patient={getPatientQuery.data}
      onSubmit={async (data) => {
        const res = await updatePatientMutation.mutateAsync({
          id: patientID,
          fullName: data.fullName,
          description: data.description,
          dateOfBirth: parse(data.dateOfBirth, "yyyy-MM-dd", new Date()),
        });

        if (res.ok) {
          router.push("/");
          toast("paciente actualizado exitosamente!");
        } else {
          toast.error("Error al crear el paciente: ", {
            description: res.errors.map((e) => e.message).join(", "),
          });
        }
      }}
    />
  );
}

type PatientFormProps = {
  patient: StrictPick<Patient, "fullName" | "description" | "dateOfBirth">;
  onSubmit: (data: z.infer<typeof newPatientSchema>) => Promise<void>;
};

function PatientForm({ patient, onSubmit }: PatientFormProps) {
  const form = useForm<z.infer<typeof newPatientSchema>>({
    defaultValues: {
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth?.toISOString().split("T")[0] ?? "",
      description: patient.description,
    },
    resolver: zodResolver(newPatientSchema),
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid w-full gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo *</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Juan Perez" {...field} />
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
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de nacimiento *</FormLabel>
                <FormControl>
                  <Input
                    lang="es"
                    type="date"
                    className="max-w-fit"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-4">
            <Button asChild variant="ghost">
              <Link href="/">Cancelar</Link>
            </Button>
            <Button type="submit">
              {form.formState.isSubmitting ? <Spinner /> : "Guardar"}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
