import { apiClient, delay, tryBackend } from "@/lib/api/client";
import type { DocumentRecord, Workflow } from "@/features/shared/types";
import { mockDocuments, mockWorkflows } from "./mock-data";

export interface CreateWorkflowInput {
  request: string;
  type: string;
}

export const workflowService = {
  list: () =>
    tryBackend<Workflow[]>(
      async () => (await apiClient.get<Workflow[]>("/api/workflows")).data,
      async () => {
        await delay();
        return mockWorkflows;
      },
    ),

  get: (id: string) =>
    tryBackend<Workflow | undefined>(
      async () => (await apiClient.get<Workflow>(`/api/workflows/${id}`)).data,
      async () => {
        await delay();
        return mockWorkflows.find((w) => w.id === id || w.reference === id);
      },
    ),

  create: (input: CreateWorkflowInput) =>
    tryBackend<Workflow>(
      async () => (await apiClient.post<Workflow>("/api/workflows", input)).data,
      async () => {
        await delay(700);
        const id = String(4900 + Math.floor(Math.random() * 90));
        return {
          id,
          reference: `WF-${id}`,
          title: input.request.slice(0, 60) || "New workflow request",
          type: input.type,
          patient: "R. Okafor",
          owner: "Unassigned",
          status: "CREATED",
          risk: "low",
          updated: "just now",
          progress: 8,
          request: input.request,
          timeline: [
            { id: "t1", label: "Request submitted", detail: "Initiated from patient portal", at: "just now", state: "done" },
            { id: "t2", label: "Agent planning", detail: "Queued for orchestration", at: "Queued", state: "queued" },
          ],
        } satisfies Workflow;
      },
    ),
};

export const documentService = {
  list: () =>
    tryBackend<DocumentRecord[]>(
      async () => (await apiClient.get<DocumentRecord[]>("/api/documents")).data,
      async () => {
        await delay();
        return mockDocuments;
      },
    ),

  get: (id: string) =>
    tryBackend<DocumentRecord | undefined>(
      async () => (await apiClient.get<DocumentRecord>(`/api/documents/${id}`)).data,
      async () => {
        await delay();
        return mockDocuments.find((d) => d.id === id) ?? mockDocuments[0];
      },
    ),

  upload: (file: File) =>
    tryBackend<DocumentRecord>(
      async () => {
        const form = new FormData();
        form.append("file", file);
        return (
          await apiClient.post<DocumentRecord>("/api/documents", form, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        ).data;
      },
      async () => {
        await delay(600);
        return { ...mockDocuments[0], fileName: file.name, sizeKb: Math.round(file.size / 1024) };
      },
    ),
};
