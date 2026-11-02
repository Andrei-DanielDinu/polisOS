import type {
  Evidence,
  Milestone,
  Problem,
  ProblemAppeal,
  ProblemStatus,
  Project,
  ProjectAppeal,
  SolutionOption
} from "./api";

const storageKey = "polisos.local-demo.v1";
const demoSubject = "demo-citizen-local";

interface DemoStore {
  problems: Problem[];
  projects: Project[];
  authors: Record<string, string>;
  projectMembers: Record<string, string[]>;
  problemAppeals: Record<string, ProblemAppeal[]>;
  projectAppeals: Record<string, ProjectAppeal[]>;
  projectAppealAuthors: Record<string, string>;
}

function dateDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function seedDemoStore(): DemoStore {
  const problemTransport: Problem = {
    id: "demo-problem-transport",
    title: "Exemplu: trecere pietonala greu de folosit langa o scoala",
    summary: "Scenariu demonstrativ. Marcajul este sters, iar accesul cu carucior sau scaun rulant este dificil. Propunerile de mai jos sunt exemple, nu raportari reale.",
    sector: "transport",
    region: "Cluj-Napoca · demo",
    visibility: "PSEUDONYMOUS",
    status: "DISCUSSION",
    createdAt: dateDaysAgo(12),
    updatedAt: dateDaysAgo(2),
    evidence: [{
      id: "demo-evidence-transport",
      sourceName: "Fotografie de inspectie demonstrativa",
      sourceUrl: null,
      description: "Exemplu de dovada care ar putea sustine o problema, fara a include o persoana sau o adresa privata.",
      confidence: "UNASSESSED",
      visibility: "PSEUDONYMOUS",
      createdAt: dateDaysAgo(10)
    }],
    options: []
  };
  const problemHealth: Problem = {
    id: "demo-problem-health",
    title: "Exemplu: programarile la un serviciu public sunt greu de inteles",
    summary: "Scenariu demonstrativ pentru compararea unor solutii cu costuri, riscuri si rezultate asteptate.",
    sector: "health",
    region: "Iasi · demo",
    visibility: "PSEUDONYMOUS",
    status: "OPTIONS",
    createdAt: dateDaysAgo(18),
    updatedAt: dateDaysAgo(1),
    evidence: [],
    options: [
      {
        id: "demo-option-plain-language",
        title: "Publicarea unui ghid simplu, cu pasi si documente necesare",
        summary: "Un ghid in limbaj clar, disponibil online si la ghiseu.",
        expectedOutcome: "Mai putine drumuri repetate si intrebari despre documente.",
        riskNotes: "Ghidul trebuie actualizat cand se schimba procedura.",
        createdAt: dateDaysAgo(4)
      },
      {
        id: "demo-option-callback",
        title: "Program de apeluri pentru clarificari",
        summary: "Un interval de telefon si un formular pentru intrebari frecvente.",
        expectedOutcome: "Cetatenii pot verifica pasii inainte de a se deplasa.",
        riskNotes: "Necesita personal, program public si masuri pentru protectia datelor.",
        createdAt: dateDaysAgo(3)
      }
    ]
  };
  const problemTransit: Problem = {
    id: "demo-problem-transit",
    title: "Exemplu: intarzieri de transport in orele de varf",
    summary: "Scenariu demonstrativ folosit de proiectul activ de mai jos. Datele nu descriu performanta reala a unui operator.",
    sector: "transport",
    region: "Bucuresti · demo",
    visibility: "PSEUDONYMOUS",
    status: "OPTIONS",
    createdAt: dateDaysAgo(30),
    updatedAt: dateDaysAgo(5),
    evidence: [],
    options: []
  };
  const project: Project = {
    id: "demo-project-transit",
    problemId: problemTransit.id,
    problemTitle: problemTransit.title,
    problemSummary: problemTransit.summary,
    sector: problemTransit.sector,
    region: problemTransit.region,
    title: "Exemplu: pilot de imbunatatire a punctualitatii",
    publicSummary: "Proiect local demonstrativ. Afiseaza cum pot arata un responsabil, o autorizare si o etapa raportata.",
    status: "ACTIVE",
    institutionName: "Institutia demonstrativa",
    authorityReference: "Referinta demonstrativa, fara valoare legala",
    fundingReference: "Finantare demonstrativa, fara buget real",
    authorizedAt: dateDaysAgo(6),
    createdAt: dateDaysAgo(8),
    milestones: [{
      id: "demo-milestone-transit",
      title: "Stabilirea reperului initial",
      description: "Raport demonstrativ, introdus numai pentru previzualizarea interfetei.",
      status: "REPORTED",
      reportedAt: dateDaysAgo(2)
    }]
  };
  return {
    problems: [problemTransport, problemHealth, problemTransit],
    projects: [project],
    authors: {},
    projectMembers: {},
    problemAppeals: {},
    projectAppeals: {},
    projectAppealAuthors: {}
  };
}

function readStore(): DemoStore {
  try {
    const serialized = localStorage.getItem(storageKey);
    if (serialized) return JSON.parse(serialized) as DemoStore;
  } catch {
    localStorage.removeItem(storageKey);
  }
  const seed = seedDemoStore();
  localStorage.setItem(storageKey, JSON.stringify(seed));
  return seed;
}

function updateStore<T>(update: (store: DemoStore) => T): T {
  const store = readStore();
  const result = update(store);
  localStorage.setItem(storageKey, JSON.stringify(store));
  return result;
}

function notFound(): never {
  throw new Error("Nu am gasit aceasta inregistrare in previzualizarea locala.");
}

function newId() {
  return crypto.randomUUID();
}

const publicStatuses = new Set<ProblemStatus>(["DISCUSSION", "OPTIONS", "PROJECT_PROPOSED", "CLOSED"]);

export function resetDemoData() {
  localStorage.removeItem(storageKey);
  localStorage.removeItem("polisos.demo-debates.v1");
  localStorage.removeItem("polisos.domain-workbench.v1");
}

export const demoApi = {
  listProblems() {
    return { items: readStore().problems.filter((problem) => problem.visibility !== "PRIVATE" && publicStatuses.has(problem.status)) };
  },
  listMyProblems() {
    const store = readStore();
    return {
      items: store.problems.filter((problem) => store.authors[problem.id] === demoSubject).map((problem) => ({
        ...problem,
        appeals: store.problemAppeals[problem.id] ?? [],
        permissions: { canAppeal: true, canReview: false }
      }))
    };
  },
  listReviewProblems() {
    return { items: [] as Problem[] };
  },
  getProblem(id: string) {
    const store = readStore();
    const problem = store.problems.find((item) => item.id === id);
    if (!problem) return notFound();
    const owned = store.authors[id] === demoSubject;
    if ((problem.visibility === "PRIVATE" || !publicStatuses.has(problem.status)) && !owned) return notFound();
    return {
      ...problem,
      appeals: owned ? store.problemAppeals[id] ?? [] : undefined,
      permissions: { canAppeal: owned, canReview: false }
    };
  },
  createProblem(body: { title: string; summary: string; sector: string; region: string; visibility: "PSEUDONYMOUS" | "PRIVATE"; consentToSubmit: boolean }) {
    if (!body.consentToSubmit) throw new Error("Confirma scopul si vizibilitatea inainte de trimitere.");
    return updateStore((store) => {
      const id = newId();
      store.problems.unshift({
        id,
        title: body.title.trim(),
        summary: body.summary.trim(),
        sector: body.sector,
        region: body.region.trim(),
        visibility: body.visibility,
        status: "SUBMITTED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        evidence: [],
        options: [],
        permissions: { canAppeal: true, canReview: false }
      });
      store.authors[id] = demoSubject;
      return { id, status: "SUBMITTED" as const };
    });
  },
  addEvidence(problemId: string, body: { sourceName: string; sourceUrl?: string; description: string; confidence: Evidence["confidence"]; consentToSubmit: boolean }) {
    if (!body.consentToSubmit) throw new Error("Confirma scopul inainte de a atasa aceasta sursa.");
    return updateStore((store) => {
      const problem = store.problems.find((item) => item.id === problemId);
      if (!problem) return notFound();
      if (problem.visibility === "PRIVATE" && store.authors[problemId] !== demoSubject) return notFound();
      if (problem.status === "CLOSED" || problem.status === "PROJECT_PROPOSED") throw new Error("Raportul este inchis pentru dovezi noi.");
      const evidence: Evidence = {
        id: newId(), sourceName: body.sourceName.trim(), sourceUrl: body.sourceUrl?.trim() || null,
        description: body.description.trim(), confidence: body.confidence,
        visibility: problem.visibility, createdAt: new Date().toISOString()
      };
      problem.evidence.push(evidence);
      return evidence;
    });
  },
  addOption(problemId: string, body: { title: string; summary: string; expectedOutcome: string; riskNotes: string }) {
    return updateStore((store) => {
      const problem = store.problems.find((item) => item.id === problemId);
      if (!problem || problem.visibility === "PRIVATE") return notFound();
      if (!["UNDER_REVIEW", "DISCUSSION", "OPTIONS"].includes(problem.status)) throw new Error("Raportul nu este deschis pentru optiuni.");
      const option: SolutionOption = { id: newId(), ...body, createdAt: new Date().toISOString() };
      problem.options.push(option);
      return option;
    });
  },
  reviewProblem(_problemId: string, _status: ProblemStatus, _reason: string) {
    throw new Error("Contul demo este cetatean colaborator; revizuirea necesita un cont separat cu rol verificat.");
  },
  appealProblem(problemId: string, reason: string) {
    return updateStore((store) => {
      if (store.authors[problemId] !== demoSubject) return notFound();
      const appeal: ProblemAppeal = { id: newId(), reason, status: "FILED", createdAt: new Date().toISOString() };
      (store.problemAppeals[problemId] ??= []).unshift(appeal);
      return { id: appeal.id, status: appeal.status };
    });
  },
  resolveProblemAppeal(_problemId: string, _appealId: string, _status: ProblemAppeal["status"], _decision: string) {
    throw new Error("Deciziile de contestatie necesita un cont separat cu rol de revizor.");
  },
  listProjects() {
    return { items: readStore().projects };
  },
  createProject(problemId: string, title: string, publicSummary: string) {
    return updateStore((store) => {
      const problem = store.problems.find((item) => item.id === problemId);
      if (!problem || problem.visibility === "PRIVATE" || problem.status !== "OPTIONS") throw new Error("Un proiect poate fi propus doar pentru un raport public aflat la etapa de comparare a optiunilor.");
      const project: Project = {
        id: newId(), problemId, problemTitle: problem.title, problemSummary: problem.summary,
        sector: problem.sector, region: problem.region, title: title.trim(), publicSummary: publicSummary.trim(),
        status: "PROPOSED", createdAt: new Date().toISOString(), milestones: []
      };
      store.projects.unshift(project);
      store.projectMembers[project.id] = [demoSubject];
      return { id: project.id, status: project.status };
    });
  },
  joinProject(projectId: string) {
    return updateStore((store) => {
      const project = store.projects.find((item) => item.id === projectId);
      if (!project || project.status === "COMPLETED" || project.status === "STOPPED") return notFound();
      const members = store.projectMembers[projectId] ??= [];
      if (!members.includes(demoSubject)) members.push(demoSubject);
      return { role: "CONTRIBUTOR", expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() };
    });
  },
  authorizeProject(_projectId: string) {
    throw new Error("Autorizarea necesita un cont separat cu rol institutional de proiect.");
  },
  addMilestone(projectId: string, body: { title: string; description: string; dueAt?: string; evidenceUrl?: string }) {
    return updateStore((store) => {
      const project = store.projects.find((item) => item.id === projectId);
      if (!project || project.status !== "ACTIVE") throw new Error("Etapele pot fi raportate doar pentru un proiect activ.");
      if (!(store.projectMembers[projectId] ?? []).includes(demoSubject)) throw new Error("Alatura-te proiectului inainte de a raporta o etapa.");
      const milestone: Milestone = {
        id: newId(), title: body.title, description: body.description, dueAt: body.dueAt,
        evidenceUrl: body.evidenceUrl, status: "REPORTED", reportedAt: new Date().toISOString()
      };
      project.milestones.unshift(milestone);
      return milestone;
    });
  },
  appealProject(projectId: string, reason: string) {
    return updateStore((store) => {
      if (!store.projects.some((item) => item.id === projectId)) return notFound();
      const appeal: ProjectAppeal = { id: newId(), reason, status: "FILED", createdAt: new Date().toISOString() };
      (store.projectAppeals[projectId] ??= []).unshift(appeal);
      store.projectAppealAuthors[appeal.id] = demoSubject;
      return { id: appeal.id, status: appeal.status };
    });
  },
  listProjectAppeals(projectId: string) {
    const store = readStore();
    return { items: (store.projectAppeals[projectId] ?? []).filter((appeal) => store.projectAppealAuthors[appeal.id] === demoSubject) };
  },
  resolveProjectAppeal(_projectId: string, _appealId: string, _status: ProjectAppeal["status"], _decision: string) {
    throw new Error("Deciziile de contestatie necesita un cont separat cu rol de revizor.");
  }
};
