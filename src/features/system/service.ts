import { apiClient, delay, tryBackend } from "@/lib/api/client";
import type { AuditEntry, HealthCheckRun, HealthComponent, ManagedUser } from "@/features/shared/types";
import { mockAudit, mockHealth, mockHealthChecks, mockUsers } from "@/features/workflows/mock-data";

export const systemService = {
  health: () =>
    tryBackend<HealthComponent[]>(
      async () => (await apiClient.get<HealthComponent[]>("/api/health")).data,
      async () => {
        await delay();
        return mockHealth;
      },
    ),

  mcpHealth: () =>
    tryBackend<HealthComponent | undefined>(
      async () => (await apiClient.get<HealthComponent>("/api/health/mcp")).data,
      async () => {
        await delay();
        return mockHealth.find((h) => h.id === "mcp");
      },
    ),

  kgHealth: () =>
    tryBackend<HealthComponent | undefined>(
      async () => (await apiClient.get<HealthComponent>("/api/health/kg")).data,
      async () => {
        await delay();
        return mockHealth.find((h) => h.id === "kg");
      },
    ),

  healthChecks: () =>
    tryBackend<HealthCheckRun[]>(
      async () => (await apiClient.get<HealthCheckRun[]>("/api/health/checks")).data,
      async () => {
        await delay();
        return mockHealthChecks;
      },
    ),

  users: () =>
    tryBackend<ManagedUser[]>(
      async () => (await apiClient.get<ManagedUser[]>("/api/users")).data,
      async () => {
        await delay();
        return mockUsers;
      },
    ),

  audit: () =>
    tryBackend<AuditEntry[]>(
      async () => (await apiClient.get<AuditEntry[]>("/api/audit")).data,
      async () => {
        await delay();
        return mockAudit;
      },
    ),
};
