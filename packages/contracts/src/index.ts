export type ProblemStatus =
  | "SUBMITTED"
  | "TRIAGE"
  | "NEEDS_EVIDENCE"
  | "UNDER_REVIEW"
  | "DISCUSSION"
  | "OPTIONS"
  | "PROJECT_PROPOSED"
  | "CLOSED";

export interface ProblemStatusChangedV1 {
  eventId: string;
  eventType: "polis.problem.status-changed.v1";
  occurredAt: string;
  problemId: string;
  status: ProblemStatus;
  title?: string;
  summary?: string;
  sector: string;
  region: string;
}

export interface ProjectProposedV1 {
  eventId: string;
  eventType: "polis.project.proposed.v1";
  occurredAt: string;
  projectId: string;
  problemId: string;
  status: "PROPOSED";
}

export interface ProjectAuthorizedV1 {
  eventId: string;
  eventType: "polis.project.authorized.v1";
  occurredAt: string;
  projectId: string;
  problemId: string;
  status: "ACTIVE";
}

