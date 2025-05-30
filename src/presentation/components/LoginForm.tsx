"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import Spinner from "./ui/spinner";
import useMutationLogin from "../mutations/useMutationLogin";

const loginSchema = z.object({
  email: z
    .string()
    .email("Debe ingresar un correo electrónico válido")
    .min(1, "Debe ingresar un correo electrónico")
    .max(100, "Máximo 100 caracteres"),
  password: z
    .string()
    .min(
      6,
      "Debe ingresar una contraseña con una longitud de al menos 6 caracteres",
    )
    .max(100, "Máximo 100 caracteres"),
});

export default function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutationLogin();
  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    const res = await loginMutation.mutateAsync({
      email: data.email,
      password: data.password,
    });
    if (!res.ok) {
      toast.error("Error al iniciar sesión: ", {
        description: res.errors.map((e) => e.message).join(", "),
      });
    } else {
      toast("Inicio de sesión exitoso");
      router.push("/");
    }
  };

  return (
    <FormProvider {...form}>
      <form
        className="grid place-content-center"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card className="w-xl max-w-full gap-8">
          <CardHeader>
            <CardTitle className="text-4xl">Accede a tu cuenta</CardTitle>
            <CardDescription>
              Obtén acceso a tu cuenta para gestionar tus pacientes
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit">
              {form.formState.isSubmitting ? <Spinner /> : "Iniciar Sesión"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
}
