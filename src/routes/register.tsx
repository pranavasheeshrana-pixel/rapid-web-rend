import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthShell } from "@/features/auth/auth-shell";
import { authService, persistUser, roleHome } from "@/features/auth/use-auth";
import type { Role } from "@/features/shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — MediLink Console" },
      { name: "description", content: "Register a MediLink console account and choose your role portal." },
      { property: "og:title", content: "Create account — MediLink Console" },
      { property: "og:description", content: "Register for the MediLink healthcare workflow prototype." },
    ],
  }),
  component: RegisterPage,
});

const schema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "At least 6 characters"),
    confirm: z.string(),
    role: z.enum(["patient", "staff", "admin", "auditor"]),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });

type FormValues = z.infer<typeof schema>;

const roles: { value: Role; label: string }[] = [
  { value: "patient", label: "Patient" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
  { value: "auditor", label: "Auditor" },
];

function RegisterPage() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirm: "", role: "patient" },
  });
  const role = form.watch("role");

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (user) => {
      persistUser(user);
      toast.success("Account created", { description: "Mock registration — no backend attached." });
      navigate({ to: roleHome[user.role] });
    },
    onError: () => toast.error("Registration failed", { description: "Please try again." }),
  });

  const fieldError = (key: keyof FormValues) =>
    form.formState.errors[key] ? (
      <p className="font-mono text-[11px] text-risk">{form.formState.errors[key]?.message}</p>
    ) : null;

  return (
    <AuthShell
      title="Create account"
      subtitle="Register for the prototype console. Synthetic data only."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) =>
          mutation.mutate({ email: values.email, password: values.password, role: values.role, name: values.name }),
        )}
      >
        <div className="space-y-1.5">
          <Label htmlFor="name" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Full name
          </Label>
          <Input id="name" {...form.register("name")} />
          {fieldError("name")}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Email
          </Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {fieldError("email")}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Password
            </Label>
            <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
            {fieldError("password")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Confirm
            </Label>
            <Input id="confirm" type="password" autoComplete="new-password" {...form.register("confirm")} />
            {fieldError("confirm")}
          </div>
        </div>

        <fieldset className="space-y-1.5">
          <legend className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Role</legend>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => form.setValue("role", option.value)}
                className={
                  role === option.value
                    ? "rounded-md border border-primary bg-primary/10 px-3 py-2 text-[13px] font-medium text-primary"
                    : "rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:border-primary/40"
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
