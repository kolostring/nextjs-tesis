"use client";
import { TutorAuthService } from "@/application/services/AuthService";
import { useDependencies } from "@/ioc/context/DependenciesProvider";
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

const loginSchema = z.object({
  email: z
    .string()
    .email("Debe ingresar un correo electrónico válido")
    .min(1, "Debe ingresar un correo electrónico")
    .max(100, "Máximo 100 caracteres"),
  password: z
    .string()
    .min(1, "Debe ingresar una contraseña")
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

  const { getContainer } = useDependencies();
  const loginUseCase = getContainer().resolve(TutorAuthService).login;

  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    const res = await loginUseCase(data.email, data.password);
    console.log(res);
    if (!res.ok) {
      toast("Error al iniciar sesión: ", {
        description: res.errors.map((e) => e.message).join(", "),
      });
    } else {
      toast(
        "Inicio de sesión exitoso. Redireccionando a la página de inicio...",
      );
      router.push("/");
    }
  };

  return (
    <FormProvider {...form}>
      <form
        className="grid min-h-dvh place-content-center"
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
