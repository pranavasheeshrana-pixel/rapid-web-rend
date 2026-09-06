import type {
  AuditEntry,
  DocumentRecord,
  HealthCheckRun,
  HealthComponent,
  ManagedUser,
  Workflow,
} from "@/features/shared/types";

export const mockWorkflows: Workflow[] = [
  {
    id: "4821",
    reference: "WF-4821",
    title: "Prior authorisation — cholecystectomy",
    type: "Prior auth",
    patient: "R. Okafor",
    owner: "K. Marsh",
    status: "PENDING_REVIEW",
    risk: "high",
    updated: "2m",
    progress: 72,
    request:
      "Request prior authorisation for a laparoscopic cholecystectomy scheduled for 12 Nov, using the attached discharge summary and current policy details.",
    timeline: [
      { id: "t1", label: "Request submitted", detail: "Initiated by R. Okafor · intake desk", at: "14:02", state: "done" },
      { id: "t2", label: "Fields extracted", detail: "5 fields · mean confidence 85%", at: "14:05", state: "done" },
      { id: "t3", label: "Clinical review", detail: "Assigned to K. Marsh", at: "In progress", state: "active" },
      { id: "t4", label: "Final sign-off", detail: "Pending review completion", at: "Queued", state: "queued" },
    ],
  },
  {
    id: "4819",
    reference: "WF-4819",
    title: "Discharge summary review",
    type: "Discharge review",
    patient: "T. Nguyen",
    owner: "A. Bell",
    status: "PROCESSING",
    risk: "medium",
    updated: "11m",
    progress: 48,
    request: "Validate the discharge summary against the billing record and flag any missing prerequisites.",
    timeline: [
      { id: "t1", label: "Request submitted", detail: "Initiated by ward clerk", at: "13:44", state: "done" },
      { id: "t2", label: "Documents ingested", detail: "2 documents · OCR complete", at: "13:47", state: "done" },
      { id: "t3", label: "Tool execution", detail: "Billing MCP · Insurance MCP", at: "In progress", state: "active" },
      { id: "t4", label: "Risk evaluation", detail: "Awaiting tool results", at: "Queued", state: "queued" },
    ],
  },
  {
    id: "4815",
    reference: "WF-4815",
    title: "Cardiology referral",
    type: "Referral",
    patient: "M. Rivera",
    owner: "K. Marsh",
    status: "CREATED",
    risk: "low",
    updated: "26m",
    progress: 12,
    request: "Create a cardiology referral for follow-up after abnormal ECG findings.",
    timeline: [
      { id: "t1", label: "Request submitted", detail: "Initiated by M. Rivera · patient portal", at: "13:29", state: "done" },
      { id: "t2", label: "Plan drafted", detail: "Agent planning queued", at: "Queued", state: "queued" },
    ],
  },
  {
    id: "4808",
    reference: "WF-4808",
    title: "Admission coordination",
    type: "Admission",
    patient: "J. Hall",
    owner: "D. Osei",
    status: "PENDING_REVIEW",
    risk: "high",
    updated: "41m",
    progress: 66,
    request: "Coordinate admission paperwork, bed allocation and insurance eligibility for a same-day admission.",
    timeline: [
      { id: "t1", label: "Request submitted", detail: "Initiated by admissions", at: "13:14", state: "done" },
      { id: "t2", label: "Eligibility checked", detail: "Insurance MCP · policy active", at: "13:20", state: "done" },
      { id: "t3", label: "Human approval", detail: "High-risk action requires sign-off", at: "In progress", state: "active" },
    ],
  },
  {
    id: "4802",
    reference: "WF-4802",
    title: "Medication adjustment record",
    type: "Med adjustment",
    patient: "L. Ford",
    owner: "A. Bell",
    status: "APPROVED",
    risk: "low",
    updated: "1h",
    progress: 100,
    request: "Record a medication dosage adjustment and notify the pharmacy system.",
    timeline: [
      { id: "t1", label: "Request submitted", detail: "Initiated by A. Bell", at: "12:51", state: "done" },
      { id: "t2", label: "Pharmacy MCP updated", detail: "Dosage change acknowledged", at: "12:55", state: "done" },
      { id: "t3", label: "Signed off", detail: "Approved by charge nurse", at: "13:02", state: "done" },
    ],
  },
];

export const mockDocuments: DocumentRecord[] = [
  {
    id: "7742",
    fileName: "discharge-summary-7742.pdf",
    docType: "Discharge summary",
    pages: 2,
    sizeKb: 1842,
    capturedAt: "07:42",
    processingProgress: 100,
    status: "PENDING_REVIEW",
    workflowRef: "WF-4821",
    fields: [
      { id: "f1", label: "Diagnosis", value: "Acute cholecystitis", confidence: 92, validation: "validated" },
      { id: "f2", label: "Procedure", value: "Laparoscopic cholecystectomy", confidence: 78, validation: "validated" },
      { id: "f3", label: "Discharge date", value: "2025-11-04", confidence: 61, validation: "needs_review" },
      { id: "f4", label: "Attending", value: "Dr. S. Ito", confidence: 98, validation: "validated" },
      { id: "f5", label: "Policy number", value: "PL-44-88213", confidence: 84, validation: "validated" },
    ],
  },
  {
    id: "7718",
    fileName: "claim-form-7718.pdf",
    docType: "Insurance claim",
    pages: 3,
    sizeKb: 2210,
    capturedAt: "09:15",
    processingProgress: 64,
    status: "PROCESSING",
    workflowRef: "WF-4819",
    fields: [
      { id: "f1", label: "Policy holder", value: "T. Nguyen", confidence: 96, validation: "validated" },
      { id: "f2", label: "Claim amount", value: "4,820.00", confidence: 71, validation: "needs_review" },
      { id: "f3", label: "Procedure code", value: "47562", confidence: 88, validation: "validated" },
      { id: "f4", label: "Service date", value: "2025-10-28", confidence: 43, validation: "invalid" },
    ],
  },
];

export const mockHealth: HealthComponent[] = [
  { id: "backend", name: "Backend API", detail: "FastAPI orchestration service", state: "up", latencyMs: 42, endpoint: "/api/health" },
  { id: "db", name: "PostgreSQL", detail: "Workflow + audit persistence", state: "up", latencyMs: 11, endpoint: "/api/health" },
  { id: "mcp", name: "MCP servers", detail: "EHR · Billing · Insurance · Pharmacy", state: "degraded", latencyMs: 318, endpoint: "/api/health/mcp" },
  { id: "kg", name: "Knowledge graph", detail: "NebulaGraph relationship store", state: "up", latencyMs: 74, endpoint: "/api/health/kg" },
];

export const mockHealthChecks: HealthCheckRun[] = [
  { id: "hc1", target: "Backend API", result: "pass", latencyMs: 42, ranAt: "14:31", note: "All routes responding" },
  { id: "hc2", target: "PostgreSQL", result: "pass", latencyMs: 11, ranAt: "14:31", note: "Connection pool healthy" },
  { id: "hc3", target: "Insurance MCP", result: "warn", latencyMs: 318, ranAt: "14:30", note: "Elevated latency on eligibility tool" },
  { id: "hc4", target: "Knowledge graph", result: "pass", latencyMs: 74, ranAt: "14:30", note: "Query plan nominal" },
  { id: "hc5", target: "Pharmacy MCP", result: "fail", latencyMs: 0, ranAt: "14:12", note: "Tool handshake timed out — retry scheduled" },
];

export const mockUsers: ManagedUser[] = [
  { id: "u1", name: "K. Marsh", email: "k.marsh@medilink.test", role: "staff", unit: "West Wing", active: true, lastSeen: "2m" },
  { id: "u2", name: "A. Bell", email: "a.bell@medilink.test", role: "staff", unit: "Unit 4W", active: true, lastSeen: "9m" },
  { id: "u3", name: "D. Osei", email: "d.osei@medilink.test", role: "admin", unit: "Operations", active: true, lastSeen: "24m" },
  { id: "u4", name: "S. Whitfield", email: "s.whitfield@medilink.test", role: "auditor", unit: "Compliance", active: true, lastSeen: "1h" },
  { id: "u5", name: "R. Okafor", email: "r.okafor@medilink.test", role: "patient", unit: "—", active: true, lastSeen: "3m" },
  { id: "u6", name: "L. Ford", email: "l.ford@medilink.test", role: "patient", unit: "—", active: false, lastSeen: "6d" },
];

export const mockAudit: AuditEntry[] = [
  { id: "a1", workflowRef: "WF-4821", actor: "agent", action: "Retrieved policy coverage", tool: "insurance.get_coverage", risk: "low", at: "14:05:12", outcome: "success" },
  { id: "a2", workflowRef: "WF-4821", actor: "agent", action: "Queried prior claim history", tool: "kg.query_relations", risk: "low", at: "14:05:41", outcome: "success" },
  { id: "a3", workflowRef: "WF-4821", actor: "policy", action: "Escalated for human approval", tool: "risk.evaluate", risk: "high", at: "14:06:02", outcome: "escalated" },
  { id: "a4", workflowRef: "WF-4819", actor: "agent", action: "Submitted claim draft", tool: "billing.create_claim", risk: "medium", at: "13:48:33", outcome: "success" },
  { id: "a5", workflowRef: "WF-4808", actor: "D. Osei", action: "Approved admission action", tool: "human.approval", risk: "high", at: "13:41:07", outcome: "success" },
  { id: "a6", workflowRef: "WF-4790", actor: "agent", action: "Pharmacy tool handshake", tool: "pharmacy.update_dose", risk: "medium", at: "12:12:55", outcome: "failed" },
  { id: "a7", workflowRef: "WF-4788", actor: "A. Bell", action: "Requested document correction", tool: "human.correction", risk: "low", at: "11:58:20", outcome: "rejected" },
];
