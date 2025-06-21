"use client";

import useQueryGetAllPatients from "../queries/useQueryGetAllPatients";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  BoxSelectIcon,
  EditIcon,
  EllipsisVerticalIcon,
  Share2Icon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { differenceInYears } from "date-fns";
import useMutationDeletePatient from "../mutations/useMutationDeletePatient";
import { toast } from "sonner";
import Spinner from "./ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import useMutationDeleteTreatment from "../mutations/useMutationDeleteTreatment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import useQueryGetUserData from "../queries/useQueryGetUserData";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "./ui/form";
import { Checkbox } from "./ui/checkbox";
import { cn } from "@/lib/utils";
import useMutationInitiatePatientShare from "../mutations/useMutationInitiatePatientShare";
import { useState } from "react";
import AcceptPatientShareDialogForm from "./AcceptPatientShareDialogForm";

const patientShareSchema = z.object({
  patientsId: z.array(z.string()).min(1),
});

export default function PatientsList() {
  const getAllPatients = useQueryGetAllPatients();
  const getUserDataQuery = useQueryGetUserData();

  const [patientShareCode, setPatientShareCode] = useState("");
  const form = useForm<z.infer<typeof patientShareSchema>>({
    defaultValues: {
      patientsId: [],
    },
    resolver: zodResolver(patientShareSchema),
  });
  const watchedPatientsToShare = form.watch("patientsId");

  const deletePatientMutation = useMutationDeletePatient({
    onSuccess: () => {
      form.setValue("patientsId", []);
    },
  });
  const deleteTreatmentMutation = useMutationDeleteTreatment();
  const initiatePatientShareMutation = useMutationInitiatePatientShare();

  if (getAllPatients.isLoading || getUserDataQuery.isLoading)
    return <div className="text-center">Cargando pacientes...</div>;
  if (getAllPatients.isError || !getAllPatients.data)
    return (
      <div>
        Ocurrió una excepción: {getAllPatients.error?.message ?? "Datos vacíos"}
      </div>
    );

  const onSubmit = async (data: z.infer<typeof patientShareSchema>) => {
    const res = await initiatePatientShareMutation.mutateAsync(data.patientsId);

    if (!res.ok) {
      toast.error(
        "Error al compartir pacientes: " + res.errors.map((err) => err.message),
      );
      return;
    }

    setPatientShareCode(res.value);
  };

  if (!getUserDataQuery.data)
    return (
      <div className="grid place-content-center text-center">
        <p className="mb-8">
          No estás autenticado. <br /> Inicia sesión para gestionar tus
          pacientes
        </p>
        <Button asChild className="mx-auto w-fit">
          <Link href="/login">Iniciar Sesión</Link>
        </Button>
      </div>
    );

  return (
    <>
      <div className="mb-12 grid items-center">
        <div>
          <h2 className="text-2xl">Tus pacientes</h2>
          <p>Previsualiza tus pacientes registrados</p>
        </div>
        <div className="flex justify-end gap-2">
          <AcceptPatientShareDialogForm />
          <Button variant="secondary" asChild>
            <Link href="/patients/new">Añadir paciente</Link>
          </Button>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {getAllPatients.data.length === 0 ? (
            <div className="grid place-items-center gap-4 text-center">
              <p className="text-muted-foreground max-w-[40ch]">
                No hay pacientes registrados. <br />
                ¡Añade uno para comenzar a gestionar su tratamiento!.
              </p>
              <Button asChild>
                <Link href="/patients/new">Añadir paciente</Link>
              </Button>
            </div>
          ) : (
            <ul>
              {getAllPatients.data.map((patient) => (
                <li key={patient.id}>
                  <div className="border-muted mb-8 flex items-center justify-between border-b">
                    <label className="flex w-full items-center gap-4 py-2">
                      <Controller
                        name="patientsId"
                        control={form.control}
                        render={({ field }) => (
                          <Checkbox
                            className={cn(field.value.length === 0 && "hidden")}
                            checked={field.value.includes(patient.id)}
                            onCheckedChange={(checked) => {
                              if (field.value.length === 0) {
                                return;
                              }

                              if (checked) {
                                field.onChange([...field.value, patient.id]);
                              } else {
                                field.onChange(
                                  field.value.filter(
                                    (val) => val !== patient.id,
                                  ),
                                );
                              }
                            }}
                          />
                        )}
                      />
                      <h3 className="flex items-end gap-2">
                        {patient.fullName}

                        <span className="pb-[2px] pl-2 text-xs text-gray-500">
                          {differenceInYears(
                            new Date(),
                            new Date(patient.dateOfBirth),
                          )}{" "}
                          años
                        </span>
                      </h3>
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-0">
                          <EllipsisVerticalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>
                          Acciones para el paciente
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Controller
                          name="patientsId"
                          control={form.control}
                          defaultValue={[]}
                          render={({ field }) => (
                            <DropdownMenuItem
                              className="flex gap-4"
                              onClick={() => {
                                if (field.value.includes(patient.id)) {
                                  field.onChange(
                                    field.value.filter(
                                      (val) => val !== patient.id,
                                    ),
                                  );
                                } else {
                                  field.onChange([...field.value, patient.id]);
                                }
                              }}
                            >
                              <BoxSelectIcon />
                              {field.value.includes(patient.id) ? (
                                <span>Deselccionar</span>
                              ) : (
                                <span>Seleccionar</span>
                              )}
                            </DropdownMenuItem>
                          )}
                        />
                        <DropdownMenuItem className="flex gap-4" asChild>
                          <Link href={`/patients/${patient.id}/edit`}>
                            <EditIcon /> Editar
                          </Link>
                        </DropdownMenuItem>
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem
                              className="flex gap-4"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <TrashIcon /> Eliminar
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Eliminar paciente</DialogTitle>
                              <DialogDescription>
                                ¿Estás seguro que quieres eliminar este
                                paciente?. Esta acción no se puede deshacer.
                              </DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                              <Button
                                variant="destructive"
                                onClick={async () => {
                                  const res =
                                    await deletePatientMutation.mutateAsync(
                                      patient.id,
                                    );
                                  if (!res.ok) {
                                    toast.error(
                                      "Error eliminando paciente: " +
                                        res.errors
                                          .map((err) => err.message)
                                          .join(", "),
                                    );
                                  }
                                }}
                              >
                                {deletePatientMutation.isPending ? (
                                  <Spinner />
                                ) : (
                                  "Eliminar"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="grid px-8 pb-8">
                    {patient.treatments.length === 0 ? (
                      <div className="grid place-items-center gap-4 text-center">
                        <p className="text-muted-foreground max-w-[40ch] text-pretty">
                          No hay tratamientos registrados. Registra uno ahora
                          para tener los recordatorios del paciente listos.
                        </p>
                        <Button className="w-fit items-center" asChild>
                          <Link href={`/patients/${patient.id}/treatments/new`}>
                            <span>Registrar Tratamiento</span>
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="mb-4">
                          Tratamientos: {patient.treatments.length}
                        </p>
                        <div className="mb-4 grid gap-4">
                          {patient.treatments.map((val) => (
                            <div
                              key={val.id}
                              className="bg-card rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex gap-2">
                                  <h3>{val.name}</h3>
                                  <p className="text-muted-foreground">
                                    ({val.eyeCondition})
                                  </p>
                                </div>
                                <div className="flex justify-end">
                                  <Button variant="ghost" asChild>
                                    <Link
                                      href={`/patients/${patient.id}/treatments/${val.id}/edit`}
                                    >
                                      <EditIcon />
                                    </Link>
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost">
                                        <TrashIcon />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Eliminar tratamiento
                                        </DialogTitle>
                                        <DialogDescription>
                                          ¿Estás seguro que quieres eliminar
                                          este tratamiento?
                                        </DialogDescription>
                                      </DialogHeader>

                                      <DialogFooter>
                                        <Button
                                          variant="destructive"
                                          onClick={async () => {
                                            const res =
                                              await deleteTreatmentMutation.mutateAsync(
                                                { id: val.id },
                                              );
                                            if (!res.ok) {
                                              toast.error(
                                                "Error eliminando tratamiento: " +
                                                  res.errors
                                                    .map((err) => err.message)
                                                    .join(", "),
                                              );
                                            }
                                          }}
                                        >
                                          {deleteTreatmentMutation.isPending ? (
                                            <Spinner />
                                          ) : (
                                            "Eliminar"
                                          )}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                              <div className="pl-12">
                                <ol className="list-decimal">
                                  {val.treatmentBlocks
                                    .map((block) =>
                                      block.therapeuticActivities.map(
                                        (activity, index) => (
                                          <li
                                            key={activity.name + val.id + index}
                                          >
                                            {activity.name}
                                          </li>
                                        ),
                                      ),
                                    )
                                    .reduce((acc, val) => acc.concat(val), [])}
                                </ol>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          className="w-fit items-center justify-self-end"
                          asChild
                        >
                          <Link href={`/patients/${patient.id}/treatments/new`}>
                            <span>Registrar Tratamiento</span>
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div
            className={cn(
              "bg-card sticky bottom-0 flex rounded-t-xl px-8 py-4",
              watchedPatientsToShare.length === 0 && "hidden",
            )}
          >
            <Button
              variant="ghost"
              type="button"
              onClick={() => form.setValue("patientsId", [])}
            >
              <XIcon />
            </Button>
            <Button type="submit" className="ml-auto">
              {form.formState.isSubmitting ? (
                <Spinner />
              ) : (
                <span>
                  Compartir pacientes ({watchedPatientsToShare.length})
                </span>
              )}
            </Button>
          </div>
        </form>
      </Form>
      <Dialog
        open={patientShareCode.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setPatientShareCode("");
            form.setValue("patientsId", []);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Código de compartición</DialogTitle>
            <DialogDescription className="mb-4">
              Copia el siguiente código y envíelo al tutor con el que quiere
              compartir el acceso a tus pacientes seleccionados.
            </DialogDescription>

            <p className="dark:bg-input/30 border-input mx-auto w-fit rounded-md border px-8 py-1 text-center text-4xl">
              {patientShareCode}
            </p>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
