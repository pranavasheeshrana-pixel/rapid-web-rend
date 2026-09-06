import { createFileRoute } from "@tanstack/react-router";
import { RoleLayout, roleConfigs } from "@/components/layout/role-layout";

export const Route = createFileRoute("/auditor")({
  component: () => <RoleLayout config={roleConfigs.auditor} />,
});
