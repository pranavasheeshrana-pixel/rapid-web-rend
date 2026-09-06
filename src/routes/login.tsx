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

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — MediLink Console" },
      { name: "description", content: "Sign in to the MediLink workflow console as a patient, staff member, administrator or auditor." },
      { property: "og:title", content: "Sign in — MediLink Console" },
      { property: "og:description", content: "Role-based access to MediLink healthcare workflow orchestration." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "At least 6 characters"),
  role: z.enum(["patient", "staff", "admin", "auditor"]),
});

type FormValues = z.infer<typeof schema>;

const roles: { value: Role; label: string }[] = [
  { value: "patient", label: "Patient" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
  { value: "auditor", label: "Auditor" },
];

function LoginPage() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "k.marsh@medilink.test", password: "medilink", role: "staff" },
  });
  const role = form.watch("role");

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => {
      persistUser(user);
      toast.success(`Signed in as ${user.role}`, { description: "Mock session — no backend attached." });
      navigate({ to: roleHome[user.role] });
    },
    onError: () => toast.error("Sign-in failed", { description: "Check the credentials and try again." }),
  });

  return (
    <AuthShell
      title="Sign in"
      subtitle="Mock authentication — pick the portal you want to open."
      footer={
        <>
          No account yet?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Email
          </Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="font-mono text-[11px] text-risk">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Password
          </Label>
          <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="font-mono text-[11px] text-risk">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <fieldset className="space-y-1.5">
          <legend className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Portal</legend>
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
          {mutation.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
