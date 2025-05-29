"use client";

import useQueryGetAllPatients from "../queries/useQueryGetAllPatients";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import Link from "next/link";
import { EditIcon, Share2Icon, TrashIcon } from "lucide-react";
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

export default function PatientsList() {
  const getAllPatients = useQueryGetAllPatients();

  const deletePatientMutation = useMutationDeletePatient();
  const deleteTreatmentMutation = useMutationDeleteTreatment();

  if (getAllPatients.isLoading) return <div>Cargando Pacientes...</div>;
  if (getAllPatients.isError || !getAllPatients.data)
    return (
      <div>
        Ocurrió una excepción: {getAllPatients.error?.message ?? "Datos vacíos"}
      </div>
    );

  debugger;

  return (
    <>
      <div className="mb-12 grid grid-cols-[1fr_auto] items-center">
        <div>
          <h2 className="text-2xl">Tus Pacientes</h2>
          <p>Previsualiza tus pacientes registrados</p>
        </div>
        <div>
          <Button variant="secondary" asChild>
            <Link href="/patients/new">Añadir Paciente</Link>
          </Button>
        </div>
      </div>
      <div>
        {getAllPatients.data.length === 0 ? (
          <div className="grid place-items-center gap-4 text-center">
            <p className="max-w-[40ch]">
              No hay pacientes registrados. <br />
              ¡Añade uno para comenzar a gestionar su tratamiento!.
            </p>
            <Button asChild>
              <Link href="/patients/new">Añadir Paciente</Link>
            </Button>
          </div>
        ) : (
          <Accordion type="single">
            {getAllPatients.data.map((patient) => (
              <AccordionItem value={patient.id} key={patient.id}>
                <AccordionTrigger>
                  <h3 className="[ flex items-end gap-2">
                    {patient.fullName}

                    <span className="pl-2 text-xs text-gray-500">
                      {differenceInYears(
                        new Date(),
                        new Date(patient.dateOfBirth!),
                      )}{" "}
                      años
                    </span>
                  </h3>
                </AccordionTrigger>
                <AccordionContent className="grid px-8 pb-8">
                  {patient.treatments.length === 0 ? (
                    <div className="grid place-items-center gap-4 text-center">
                      <p className="max-w-[40ch] text-pretty">
                        No hay tratamientos registrados. Registra uno ahora para
                        tener los recordatorios del paciente listos.
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
                      <Accordion type="multiple" className="mb-4 gap-4">
                        {patient.treatments.map((val) => (
                          <AccordionItem
                            value={val.id}
                            key={val.id}
                            className="bg-card rounded-lg"
                          >
                            <AccordionTrigger className="px-4">
                              {val.name}
                            </AccordionTrigger>
                            <AccordionContent className="pr-4 pl-16">
                              <ol className="list-decimal">
                                {val.treatmentBlocks
                                  .map((block) =>
                                    block.therapeuticActivities.map(
                                      (activity) => (
                                        <li key={activity.name + val.id}>
                                          {activity.name}
                                        </li>
                                      ),
                                    ),
                                  )
                                  .reduce((acc, val) => acc.concat(val), [])}
                              </ol>

                              <div className="mt-4 flex justify-end">
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
                                        ¿Estás seguro que quieres eliminar este
                                        tratamiento?
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
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
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
                  <div className="flex justify-end pt-4">
                    <Button variant="ghost" asChild>
                      <Link href={`/patients/${patient.id}/edit`}>
                        <EditIcon />
                      </Link>
                    </Button>
                    <Button variant="ghost">
                      <Share2Icon />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost">
                          <TrashIcon />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Eliminar Paciente</DialogTitle>
                          <DialogDescription>
                            ¿Estás seguro que quieres eliminar este paciente?.
                            Esta acción no se puede deshacer.
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </>
  );
}
