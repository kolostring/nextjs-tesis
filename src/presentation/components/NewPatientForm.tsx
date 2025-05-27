"use client";

import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
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
import { useDependencies } from "@/ioc/context/DependenciesProvider";
import { PatientRepository } from "@/domain/repositories/PatientRepository";
import { isAfter, isBefore, isValid, parse } from "date-fns";
import { toast } from "sonner";

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
      console.log(arg);
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

export default function NewPatientForm() {
  const router = useRouter();
  const { getContainer } = useDependencies();

  const form = useForm<z.infer<typeof newPatientSchema>>({
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      description: "",
    },
    resolver: zodResolver(newPatientSchema),
  });

  const onSubmit = async (data: z.infer<typeof newPatientSchema>) => {
    const res = await getContainer()
      .resolve(PatientRepository)
      .createPatient({
        fullName: data.fullName,
        description: data.description,
        dateOfBirth: parse(data.dateOfBirth, "yyyy-MM-dd", new Date()),
      });

    if (res.ok) {
      router.push("/");
      toast("Paciente creado exitosamente!, redirigiendo...");
    } else {
      console.log(res);
      toast.error("Error al crear el paciente: ", {
        description: res.errors.map((e) => e.message).join(", "),
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="grid w-xl max-w-full gap-8">
          <CardHeader>
            <CardTitle className="text-4xl">
              <h1>Nuevo Paciente</h1>
            </CardTitle>
            <CardDescription>
              Registra un nuevo paciente para gestionar su progreso
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
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
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit">Crear Paciente</Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
}
