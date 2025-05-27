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

export default function PatientsList() {
  const getAllPatients = useQueryGetAllPatients();

  if (getAllPatients.isLoading) return <div>Cargando Pacientes...</div>;
  if (getAllPatients.isError)
    return <div>Ocurrió una excepción: {getAllPatients.error.message}</div>;
  if (!getAllPatients.data) return <div>Datos vacíos</div>;
  if (!getAllPatients.data.ok)
    return <div>Error: {getAllPatients.data.errors[0].message}</div>;

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
        {getAllPatients.data.value.length === 0 ? (
          <p>No hay pacientes registrados.</p>
        ) : (
          <Accordion type="single">
            {getAllPatients.data.value.map((patient) => (
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
                <AccordionContent className="pb-8">
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
                    <p>Tratamientos: {patient.treatments.length}</p>
                  )}
                  <div className="flex justify-end pt-4">
                    <Button variant="ghost">
                      <EditIcon />
                    </Button>
                    <Button variant="ghost">
                      <Share2Icon />
                    </Button>
                    <Button variant="ghost">
                      <TrashIcon />
                    </Button>
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
