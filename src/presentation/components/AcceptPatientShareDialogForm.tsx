import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import useMutationAcceptPatientShare from "../mutations/useMutationAcceptPatientShare";
import { toast } from "sonner";
import Spinner from "./ui/spinner";

const acceptPatientShareSchema = z.object({
  shareCode: z.string().min(1, "Debe ingresar un código de compartición"),
});

export default function AcceptPatientShareDialogForm() {
  const form = useForm<z.infer<typeof acceptPatientShareSchema>>({
    defaultValues: {
      shareCode: "",
    },
    resolver: zodResolver(acceptPatientShareSchema),
  });

  const acceptPatientShareMutation = useMutationAcceptPatientShare();

  const onSubmit = async (data: z.infer<typeof acceptPatientShareSchema>) => {
    const res = await acceptPatientShareMutation.mutateAsync(data.shareCode);

    if (res.ok) {
      toast("paciente compartido exitosamente!");
    } else {
      toast.error(
        "Error al compartir paciente: " +
          res.errors.map((err) => err.message).join(", "),
      );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" type="button">
          Aceptar pacientes compartidos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recibir pacientes compartidos</DialogTitle>
          <DialogDescription className="mb-4">
            Pega el código de compartición ofrecido por el tutor del que
            provienen los pacientes a compartir y accede a permisos para
            gestionarlos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid">
            <FormField
              control={form.control}
              name="shareCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de compartición *</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-4">
              {form.formState.isSubmitting ? (
                <Spinner />
              ) : (
                <span>Aceptar pacientes</span>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
