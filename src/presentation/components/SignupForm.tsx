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
import useMutationSignup from "../mutations/useMutationSignup";

const signupSchema = z
  .object({
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
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden",
      });
    }
  });

export default function SignupForm() {
  const form = useForm<z.infer<typeof signupSchema>>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(signupSchema),
  });

  const signupMutation = useMutationSignup();

  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    const res = await signupMutation.mutateAsync({
      email: data.email,
      password: data.password,
    });
    if (!res.ok) {
      toast.error("Error al iniciar sesión: ", {
        description: res.errors.map((e) => e.message).join(", "),
      });
    } else {
      toast("Registro exitoso");
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
            <CardTitle>
              <h2 className="text-4xl">Regístrate</h2>
            </CardTitle>
            <CardDescription>
              Obtén un perfil personalizado y gestiona tus pacientes
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
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      {...field}
                    />
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña</FormLabel>
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
              {form.formState.isLoading ? <Spinner /> : "Registarse"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
}
