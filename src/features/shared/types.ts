export type Role = "patient" | "staff" | "admin" | "auditor";

export type WorkflowStatus =
  | "CREATED"
  | "PLANNING"
  | "PROCESSING"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "FAILED";

export type RiskLevel = "low" | "medium" | "high";

export type ValidationStatus = "validated" | "needs_review" | "invalid";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  unit: string;
}

export interface TimelineEvent {
  id: string;
  label: string;
  detail: string;
  at: string;
  state: "done" | "active" | "queued" | "failed";
}

export interface Workflow {
  id: string;
  reference: string;
  title: string;
  type: string;
  patient: string;
  owner: string;
  status: WorkflowStatus;
  risk: RiskLevel;
  updated: string;
  progress: number;
  request: string;
  timeline: TimelineEvent[];
}

export interface ExtractedField {
  id: string;
  label: string;
  value: string;
  confidence: number;
  validation: ValidationStatus;
}

export interface DocumentRecord {
  id: string;
  fileName: string;
  docType: string;
  pages: number;
  sizeKb: number;
  capturedAt: string;
  processingProgress: number;
  status: WorkflowStatus;
  workflowRef: string;
  fields: ExtractedField[];
}

export interface HealthComponent {
  id: string;
  name: string;
  detail: string;
  state: "up" | "degraded" | "down";
  latencyMs: number;
  endpoint: string;
}

export interface HealthCheckRun {
  id: string;
  target: string;
  result: "pass" | "warn" | "fail";
  latencyMs: number;
  ranAt: string;
  note: string;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  unit: string;
  active: boolean;
  lastSeen: string;
}

export interface AuditEntry {
  id: string;
  workflowRef: string;
  actor: string;
  action: string;
  tool: string;
  risk: RiskLevel;
  at: string;
  outcome: "success" | "escalated" | "rejected" | "failed";
}
