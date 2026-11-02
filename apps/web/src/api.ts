import type { User } from "./auth";
import { isDemoUser } from "./auth";
import { demoApi } from "./demo-api";

export type ProblemStatus =
  | "SUBMITTED"
  | "TRIAGE"
  | "NEEDS_EVIDENCE"
  | "UNDER_REVIEW"
  | "DISCUSSION"
  | "OPTIONS"
  | "PROJECT_PROPOSED"
  | "CLOSED";

export interface Evidence {
  id: string;
  sourceName: string;
  sourceUrl?: string | null;
  description: string;
  confidence: "LOW" | "MEDIUM" | "HIGH" | "UNASSESSED";
  visibility: "PUBLIC" | "PSEUDONYMOUS" | "PRIVATE";
  createdAt: string;
}

export interface SolutionOption {
  id: string;
  title: string;
  summary: string;
  expectedOutcome: string;
  riskNotes: string;
  createdAt: string;
}

export interface ProblemAppeal {
  id: string;
  reason: string;
  status: "FILED" | "IN_REVIEW" | "UPHELD" | "RETURNED_FOR_REVIEW" | "DISMISSED";
  decision?: string | null;
  createdAt: string;
  decidedAt?: string | null;
}

export interface Problem {
  id: string;
  title: string;
  summary: string;
  sector: string;
  region: string;
  visibility: "PUBLIC" | "PSEUDONYMOUS" | "PRIVATE";
  status: ProblemStatus;
  createdAt: string;
  updatedAt: string;
  evidence: Evidence[];
  options: SolutionOption[];
  appeals?: ProblemAppeal[];
  permissions?: { canAppeal: boolean; canReview: boolean };
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueAt?: string | null;
  evidenceUrl?: string | null;
  status: "REPORTED" | "REVIEWED" | "NEEDS_CORRECTION";
  reportedAt: string;
}

export interface ProjectAppeal {
  id: string;
  reason: string;
  status: "FILED" | "IN_REVIEW" | "UPHELD" | "RETURNED_FOR_REVIEW" | "DISMISSED";
  decision?: string | null;
  createdAt: string;
  decidedAt?: string | null;
}

export interface Project {
  id: string;
  problemId: string;
  problemTitle: string;
  problemSummary: string;
  sector: string;
  region: string;
  title: string;
  publicSummary: string;
  status: "PROPOSED" | "ACTIVE" | "COMPLETED" | "STOPPED";
  institutionName?: string | null;
  authorityReference?: string | null;
  fundingReference?: string | null;
  authorizedAt?: string | null;
  createdAt: string;
  milestones: Milestone[];
}

const problemApi = import.meta.env.VITE_PROBLEM_API ?? "http://localhost:4101";
const projectApi = import.meta.env.VITE_PROJECT_API ?? "http://localhost:4102";

async function request<T>(url: string, user?: User | null, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (user?.access_token) headers.set("Authorization", `Bearer ${user.access_token}`);
  let response: Response;
  try {
    response = await fetch(url, { ...init, headers });
  } catch {
    throw new Error("Serviciile locale nu raspund. Porneste Docker Compose sau foloseste Demo cetatean pentru o previzualizare locala.");
  }
  const value = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof value.message === "string" ? value.message : "The request could not be completed.";
    throw new Error(message);
  }
  return value as T;
}

export const api = {
  async listProblems(user?: User | null) {
    if (isDemoUser(user)) return demoApi.listProblems();
    return request<{ items: Problem[] }>(`${problemApi}/api/problems`, user);
  },
  async listMyProblems(user: User) {
    if (isDemoUser(user)) return demoApi.listMyProblems();
    return request<{ items: Problem[] }>(`${problemApi}/api/my/problems`, user);
  },
  async listReviewProblems(user: User) {
    if (isDemoUser(user)) return demoApi.listReviewProblems();
    return request<{ items: Problem[] }>(`${problemApi}/api/review/problems`, user);
  },
  async getProblem(id: string, user?: User | null) {
    if (isDemoUser(user)) return demoApi.getProblem(id);
    return request<Problem>(`${problemApi}/api/problems/${id}`, user);
  },
  async createProblem(body: {
    title: string; summary: string; sector: string; region: string;
    visibility: "PSEUDONYMOUS" | "PRIVATE"; consentToSubmit: boolean;
  }, user: User) {
    if (isDemoUser(user)) return demoApi.createProblem(body);
    return request<{ id: string; status: ProblemStatus }>(`${problemApi}/api/problems`, user, {
      method: "POST", body: JSON.stringify(body)
    });
  },
  async addEvidence(problemId: string, body: {
    sourceName: string; sourceUrl?: string; description: string; confidence: Evidence["confidence"]; consentToSubmit: boolean;
  }, user: User) {
    if (isDemoUser(user)) return demoApi.addEvidence(problemId, body);
    return request<Evidence>(`${problemApi}/api/problems/${problemId}/evidence`, user, {
      method: "POST", body: JSON.stringify(body)
    });
  },
  async addOption(problemId: string, body: {
    title: string; summary: string; expectedOutcome: string; riskNotes: string;
  }, user: User) {
    if (isDemoUser(user)) return demoApi.addOption(problemId, body);
    return request<SolutionOption>(`${problemApi}/api/problems/${problemId}/options`, user, {
      method: "POST", body: JSON.stringify(body)
    });
  },
  async reviewProblem(problemId: string, status: ProblemStatus, reason: string, user: User) {
    if (isDemoUser(user)) return demoApi.reviewProblem(problemId, status, reason);
    return request<{ id: string; status: ProblemStatus }>(`${problemApi}/api/problems/${problemId}/review`, user, {
      method: "POST", body: JSON.stringify({ status, reason })
    });
  },
  async appealProblem(problemId: string, reason: string, user: User) {
    if (isDemoUser(user)) return demoApi.appealProblem(problemId, reason);
    return request<{ id: string; status: string }>(`${problemApi}/api/problems/${problemId}/appeals`, user, {
      method: "POST", body: JSON.stringify({ reason })
    });
  },
  async resolveProblemAppeal(problemId: string, appealId: string, status: "UPHELD" | "RETURNED_FOR_REVIEW" | "DISMISSED", decision: string, user: User) {
    if (isDemoUser(user)) return demoApi.resolveProblemAppeal(problemId, appealId, status, decision);
    return request<ProblemAppeal>(`${problemApi}/api/problems/${problemId}/appeals/${appealId}`, user, {
      method: "PATCH", body: JSON.stringify({ status, decision })
    });
  },
  async listProjects(user?: User | null) {
    if (isDemoUser(user)) return demoApi.listProjects();
    return request<{ items: Project[] }>(`${projectApi}/api/projects`, user);
  },
  async createProject(problemId: string, title: string, publicSummary: string, user: User) {
    if (isDemoUser(user)) return demoApi.createProject(problemId, title, publicSummary);
    return request<{ id: string; status: Project["status"] }>(`${projectApi}/api/projects`, user, {
      method: "POST", body: JSON.stringify({ problemId, title, publicSummary })
    });
  },
  async joinProject(projectId: string, user: User) {
    if (isDemoUser(user)) return demoApi.joinProject(projectId);
    return request<{ role: string; expiresAt: string }>(`${projectApi}/api/projects/${projectId}/join`, user, {
      method: "POST", body: JSON.stringify({})
    });
  },
  async authorizeProject(projectId: string, body: {
    institutionName: string; authorityReference: string; fundingReference: string; decisionReason: string;
  }, user: User) {
    if (isDemoUser(user)) return demoApi.authorizeProject(projectId);
    return request<{ id: string; status: Project["status"] }>(`${projectApi}/api/projects/${projectId}/authorization`, user, {
      method: "POST", body: JSON.stringify(body)
    });
  },
  async addMilestone(projectId: string, body: {
    title: string; description: string; dueAt?: string; evidenceUrl?: string;
  }, user: User) {
    if (isDemoUser(user)) return demoApi.addMilestone(projectId, body);
    return request<Milestone>(`${projectApi}/api/projects/${projectId}/milestones`, user, {
      method: "POST", body: JSON.stringify(body)
    });
  },
  async appealProject(projectId: string, reason: string, user: User) {
    if (isDemoUser(user)) return demoApi.appealProject(projectId, reason);
    return request<{ id: string; status: string }>(`${projectApi}/api/projects/${projectId}/appeals`, user, {
      method: "POST", body: JSON.stringify({ reason })
    });
  },
  async listProjectAppeals(projectId: string, user: User) {
    if (isDemoUser(user)) return demoApi.listProjectAppeals(projectId);
    return request<{ items: ProjectAppeal[] }>(`${projectApi}/api/projects/${projectId}/appeals`, user);
  },
  async resolveProjectAppeal(projectId: string, appealId: string, status: "UPHELD" | "RETURNED_FOR_REVIEW" | "DISMISSED", decision: string, user: User) {
    if (isDemoUser(user)) return demoApi.resolveProjectAppeal(projectId, appealId, status, decision);
    return request<ProjectAppeal>(`${projectApi}/api/projects/${projectId}/appeals/${appealId}`, user, {
      method: "PATCH", body: JSON.stringify({ status, decision })
    });
  }
};

