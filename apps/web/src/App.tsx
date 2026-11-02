import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api, Problem, ProblemAppeal, ProblemStatus, Project, ProjectAppeal } from "./api";
import { clearDemoSession, createDemoUser, finishSignIn, getRoles, hasDemoSession, isDemoUser, signIn, signOut, User, userManager } from "./auth";
import { resetDemoData } from "./demo-api";
import { ControlRoom } from "./ControlRoom";
import { CitizenBalance } from "./CitizenBalance";

const statusLabels: Record<ProblemStatus, string> = {
  SUBMITTED: "Trimis spre triere",
  TRIAGE: "In triere",
  NEEDS_EVIDENCE: "Necesita dovezi",
  UNDER_REVIEW: "In analiza",
  DISCUSSION: "In discutie",
  OPTIONS: "Compara solutii",
  PROJECT_PROPOSED: "Proiect propus",
  CLOSED: "Inchis"
};

const sectors = [
  ["public-services", "Servicii publice"],
  ["education", "Educatie"],
  ["health", "Sanatate"],
  ["transport", "Transport"],
  ["infrastructure", "Infrastructura"],
  ["economy", "Economie si munca"],
  ["agriculture", "Agricultura"],
  ["environment", "Mediu"],
  ["administration", "Administratie"],
  ["other", "Alt domeniu"]
];

const reviewTransitions: Record<ProblemStatus, ProblemStatus[]> = {
  SUBMITTED: ["TRIAGE", "NEEDS_EVIDENCE", "CLOSED"],
  TRIAGE: ["NEEDS_EVIDENCE", "UNDER_REVIEW", "CLOSED"],
  NEEDS_EVIDENCE: ["UNDER_REVIEW", "CLOSED"],
  UNDER_REVIEW: ["NEEDS_EVIDENCE", "DISCUSSION", "OPTIONS", "CLOSED"],
  DISCUSSION: ["UNDER_REVIEW", "OPTIONS", "CLOSED"],
  OPTIONS: ["PROJECT_PROPOSED", "DISCUSSION", "CLOSED"],
  PROJECT_PROPOSED: ["CLOSED"],
  CLOSED: []
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", { dateStyle: "medium" }).format(new Date(value));
}

function App() {
  const [page, setPage] = useState<"national" | "workflow" | "citizen">("national");
  const [user, setUser] = useState<User | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [myProblems, setMyProblems] = useState<Problem[]>([]);
  const [reviewQueue, setReviewQueue] = useState<Problem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Problem | null>(null);
  const [query, setQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const roles = useMemo(() => getRoles(user), [user]);

  const startSignIn = async () => {
    setError("");
    try {
      await signIn();
    } catch {
      setError("Furnizorul local de autentificare nu raspunde. Porneste Docker Compose sau foloseste sesiunea Demo cetatean.");
    }
  };

  const refresh = useCallback(async () => {
    try {
      const [problemResult, projectResult, ownResult] = await Promise.all([
        api.listProblems(user),
        api.listProjects(user),
        user ? api.listMyProblems(user) : Promise.resolve({ items: [] as Problem[] })
      ]);
      const reviewResult = user && getRoles(user).includes("reviewer")
        ? await api.listReviewProblems(user)
        : { items: [] as Problem[] };
      setProblems(problemResult.items);
      setProjects(projectResult.items);
      setMyProblems(ownResult.items);
      setReviewQueue(reviewResult.items);
      if (selected) {
        const refreshed = await api.getProblem(selected.id, user);
        setSelected(refreshed);
      }
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Nu am putut incarca datele.");
    }
  }, [user, selected?.id]);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        if (hasDemoSession()) {
          if (active) setUser(createDemoUser());
          return;
        }
        if (window.location.pathname === "/auth/callback") {
          await finishSignIn();
          window.history.replaceState({}, document.title, "/");
        }
        const current = await userManager.getUser();
        if (active) setUser(current && !current.expired ? current : null);
      } catch {
        if (active) setError("Autentificarea nu a putut fi finalizata. Incearca din nou.");
        window.history.replaceState({}, document.title, "/");
      }
    };
    void initialize();
    const loaded = (next: User) => setUser(next);
    const unloaded = () => setUser(null);
    userManager.events.addUserLoaded(loaded);
    userManager.events.addUserUnloaded(unloaded);
    return () => {
      active = false;
      userManager.events.removeUserLoaded(loaded);
      userManager.events.removeUserUnloaded(unloaded);
    };
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const openProblem = async (problem: Problem) => {
    try {
      setSelected(await api.getProblem(problem.id, user));
      setNotice("");
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Nu am putut deschide problema.");
    }
  };

  const submitProblem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      await startSignIn();
      return;
    }
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true);
    setError("");
    try {
      const created = await api.createProblem({
        title: String(form.get("title")),
        summary: String(form.get("summary")),
        sector: String(form.get("sector")),
        region: String(form.get("region")),
        visibility: String(form.get("visibility")) as "PSEUDONYMOUS" | "PRIVATE",
        consentToSubmit: form.get("consent") === "on"
      }, user);
      setNotice("Problema a fost trimisa. Urmareste statusul din lista.");
      formElement.reset();
      await refresh();
      const item = await api.getProblem(created.id, user);
      setSelected(item);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Problema nu a putut fi trimisa.");
    } finally {
      setBusy(false);
    }
  };

  const submitOption = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !user) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true);
    setError("");
    try {
      await api.addOption(selected.id, {
        title: String(form.get("title")),
        summary: String(form.get("summary")),
        expectedOutcome: String(form.get("expectedOutcome")),
        riskNotes: String(form.get("riskNotes"))
      }, user);
      formElement.reset();
      await openProblem(selected);
      setNotice("Solutia a fost adaugata pentru evaluare.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Solutia nu a putut fi trimisa.");
    } finally {
      setBusy(false);
    }
  };

  const submitEvidence = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !user) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true);
    setError("");
    try {
      await api.addEvidence(selected.id, {
        sourceName: String(form.get("sourceName")),
        sourceUrl: String(form.get("sourceUrl") || "") || undefined,
        description: String(form.get("description")),
        confidence: String(form.get("confidence")) as "LOW" | "MEDIUM" | "HIGH" | "UNASSESSED",
        consentToSubmit: form.get("consent") === "on"
      }, user);
      formElement.reset();
      await openProblem(selected);
      setNotice("Sursa a fost adaugata.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sursa nu a putut fi adaugata.");
    } finally {
      setBusy(false);
    }
  };

  const proposeProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !user) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true);
    setError("");
    try {
      await api.createProject(selected.id, String(form.get("title")), String(form.get("summary")), user);
      formElement.reset();
      await refresh();
      setNotice("Proiectul a fost propus. Inca nu are autorizare sau finantare confirmata.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Proiectul nu a putut fi propus.");
    } finally {
      setBusy(false);
    }
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesQuery = `${problem.title} ${problem.summary} ${problem.region}`.toLowerCase().includes(query.toLowerCase());
    const matchesSector = sectorFilter === "all" || problem.sector === sectorFilter;
    return matchesQuery && matchesSector;
  });

  const openCount = problems.filter((problem) => !["CLOSED", "PROJECT_PROPOSED"].includes(problem.status)).length;
  const activeProjects = projects.filter((project) => project.status === "ACTIVE").length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="PolisOS pagina principala">
          <span className="brand-mark">P</span>
          <span>polis<span className="brand-os">OS</span></span>
        </a>
        <nav className="top-nav" aria-label="Navigare principala">
          <button className={page === "national" ? "active" : ""} onClick={() => setPage("national")}>Sisteme nationale</button>
          <button className={page === "citizen" ? "active" : ""} onClick={() => setPage("citizen")}>Economia cetățeanului</button>
          <button className={page === "workflow" ? "active" : ""} onClick={() => setPage("workflow")}>Probleme si proiecte</button>
        </nav>
        <div className="account-area">
          {user ? (
            <>
              <span className="signed-in" title="Identitatea contului nu este afisata public">
                {isDemoUser(user) ? "Cetatean demo" : "Conectat"}
              </span>
              <button className="button button-small button-outline" onClick={() => {
                if (isDemoUser(user)) {
                  clearDemoSession();
                  setUser(null);
                  setNotice("");
                } else void signOut(user);
              }}>Iesire</button>
            </>
          ) : (
            <>
              {import.meta.env.DEV && <button className="button button-small button-demo" onClick={() => {
                setUser(createDemoUser());
                setError("");
                setNotice("Esti in previzualizarea locala ca demo.citizen@polisos.local. Nu este o autentificare reala.");
              }}>Demo cetatean</button>}
              <button className="button button-small button-outline" onClick={() => void startSignIn()}>Conectare</button>
            </>
          )}
        </div>
      </header>

      {error && (page === "workflow" || (page === "national" && !error.startsWith("Serviciile locale nu raspund."))) && <div className="notice notice-error" role="alert">{error}</div>}
      {notice && <div className="notice notice-success" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Inchide mesajul">×</button></div>}

      {page === "national" ? <ControlRoom
        canParticipate={isDemoUser(user)}
        onEnterDemo={() => {
          if (!isDemoUser(user)) setUser(createDemoUser());
          setError("");
          setNotice("Sesiune demo activa. Continutul adaugat ramane in acest browser.");
        }}
        onOpenWorkflow={() => setPage("workflow")}
      /> : page === "citizen" ? <CitizenBalance /> : <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> O platforma civica pentru Romania</p>
            <h1>Transformam problemele publice in proiecte pe care le putem urmari.</h1>
            <p className="hero-lede">
              Descrie o problema, adauga dovezi, compara solutii si urmareste daca un proiect are un responsabil si progrese verificabile.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#submit">Propune o problema <span aria-hidden="true">↗</span></a>
              <a className="text-link" href="#how">Vezi cum functioneaza <span aria-hidden="true">→</span></a>
            </div>
            <div className="hero-note"><span className="note-icon">i</span> Participarea este voluntara. Nu este necesar un cont pentru a citi informatiile publice.</div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />
            <div className="visual-center"><span>◉</span><small>problema</small></div>
            <div className="visual-node node-evidence"><b>01</b><span>Dovezi</span></div>
            <div className="visual-node node-options"><b>02</b><span>Optiuni</span></div>
            <div className="visual-node node-project"><b>03</b><span>Proiect</span></div>
            <div className="visual-node node-results"><b>04</b><span>Rezultat</span></div>
          </div>
        </section>

        <section className="metrics-row" aria-label="Indicatori publici">
          <div className="metric"><strong>{problems.length}</strong><span>probleme vizibile</span></div>
          <div className="metric"><strong>{openCount}</strong><span>in proces de analiza</span></div>
          <div className="metric"><strong>{projects.length}</strong><span>proiecte propuse</span></div>
          <div className="metric"><strong>{activeProjects}</strong><span>proiecte active autorizate</span></div>
          <p>Datele arata starea fluxului, nu un scor al cetatenilor.</p>
        </section>

        {isDemoUser(user) && <div className="notice notice-demo" role="status">
          Demo local: exemplele sunt fictive, iar schimbarile raman in stocarea acestui browser. <button onClick={() => { resetDemoData(); window.location.reload(); }}>Reseteaza datele demo</button>
        </div>}

        <section className="section problems-section" id="problems">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Semnale din comunitate</p>
              <h2>Probleme care asteapta o solutie</h2>
              <p className="section-intro">Vezi ce a fost raportat, ce dovezi exista si in ce etapa se afla fiecare propunere.</p>
            </div>
            <a className="button button-primary" href="#submit">+ Propune o problema</a>
          </div>
          <div className="filter-bar">
            <label className="search-wrap">
              <span aria-hidden="true">⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cauta dupa problema sau regiune" aria-label="Cauta probleme" />
            </label>
            <select value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)} aria-label="Filtreaza dupa domeniu">
              <option value="all">Toate domeniile</option>
              {sectors.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button className="button button-outline" onClick={() => void refresh()}>Reincarca</button>
          </div>
          {myProblems.length > 0 && <div className="my-contributions">
            <div><strong>Contributiile mele</strong><span>Vizibile doar in sesiunea contului tau</span></div>
            {myProblems.map((problem) => <button key={problem.id} className="my-contribution" onClick={() => void openProblem(problem)}><span>{problem.title}</span><small>{statusLabels[problem.status]}</small></button>)}
          </div>}
          <div className="problem-grid">
            {filteredProblems.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">↗</div>
                <h3>Inca nu exista rapoarte publice in aceasta selectie</h3>
                <p>O problema poate fi trimisa voluntar si revizuita cu dovezi inainte de a deveni o propunere de proiect.</p>
              </div>
            )}
            {filteredProblems.map((problem) => (
              <article className="problem-card" key={problem.id}>
                <div className="card-topline">
                  <span className="sector-label">{sectors.find(([value]) => value === problem.sector)?.[1] ?? problem.sector}</span>
                  <span className={`status-pill status-${problem.status.toLowerCase()}`}>{statusLabels[problem.status]}</span>
                </div>
                <h3>{problem.title}</h3>
                <p className="problem-summary">{problem.summary}</p>
                <div className="card-meta">
                  <span><span aria-hidden="true">⌖</span> {problem.region}</span>
                  <span><span aria-hidden="true">◷</span> {formatDate(problem.createdAt)}</span>
                </div>
                <div className="card-bottom">
                  <span>{problem.evidence.length} surse · {problem.options.length} solutii</span>
                  <button className="text-link" onClick={() => void openProblem(problem)}>Deschide <span aria-hidden="true">→</span></button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {roles.includes("reviewer") && <section className="section review-queue-section" aria-labelledby="review-queue-title">
          <div className="section-heading">
            <div><p className="eyebrow">Spatiu de lucru cu acces controlat</p><h2 id="review-queue-title">Coada de triere si revizuire</h2><p className="section-intro">Contine si raportari private. Acestea sunt vizibile numai conturilor cu rol de revizor.</p></div>
            <span className="section-counter">{reviewQueue.length} de verificat</span>
          </div>
          <div className="problem-grid">
            {reviewQueue.filter((problem) => !["CLOSED", "PROJECT_PROPOSED"].includes(problem.status)).map((problem) => <article className="problem-card" key={problem.id}>
              <div className="card-topline"><span className="sector-label">{problem.sector}</span><span className="status-pill status-submitted">{problem.visibility === "PRIVATE" ? "Privata" : "Pseudonima"} · {statusLabels[problem.status]}</span></div>
              <h3>{problem.title}</h3><p className="problem-summary">{problem.summary}</p>
              <div className="card-meta"><span>{problem.region}</span><span>{problem.evidence.length} surse</span></div>
              <div className="card-bottom"><span>Trimisa la {formatDate(problem.createdAt)}</span><button className="text-link" onClick={() => void openProblem(problem)}>Deschide pentru revizuire →</button></div>
            </article>)}
            {reviewQueue.filter((problem) => !["CLOSED", "PROJECT_PROPOSED"].includes(problem.status)).length === 0 && <div className="empty-state compact"><p>Nu exista raportari care asteapta o actiune de revizuire.</p></div>}
          </div>
        </section>}

        <section className="section project-section" id="projects">
          <div className="section-heading">
            <div>
              <p className="eyebrow">De la propunere la livrare</p>
              <h2>Proiecte cu stari vizibile</h2>
              <p className="section-intro">Propus nu inseamna aprobat. Un proiect devine activ numai dupa ce un responsabil institutional inregistreaza baza de autoritate si finantarea.</p>
            </div>
            <span className="section-counter">{projects.length} inregistrate</span>
          </div>
          <div className="project-grid">
            {projects.length === 0 && <div className="empty-state compact"><p>Proiectele apar aici dupa ce o problema ajunge la etapa de comparare a solutiilor.</p></div>}
            {projects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-card-head">
                  <span className={`project-symbol project-${project.status.toLowerCase()}`}>{project.status === "ACTIVE" ? "✓" : "◌"}</span>
                  <span className={`status-pill project-status-${project.status.toLowerCase()}`}>{project.status === "ACTIVE" ? "Activ · autorizat" : project.status === "PROPOSED" ? "Propus · fara autorizare" : project.status === "COMPLETED" ? "Evaluat si inchis" : "Oprit"}</span>
                </div>
                <h3>{project.title}</h3>
                <p className="project-source">Raspunde la: <button className="text-link" onClick={() => {
                  const linked = problems.find((problem) => problem.id === project.problemId);
                  if (linked) void openProblem(linked);
                }}>{project.problemTitle}</button></p>
                <p>{project.publicSummary}</p>
                {project.status === "ACTIVE" && <div className="authority-note">Responsabil: {project.institutionName}. Resurse si baza de autorizare sunt inregistrate.</div>}
                <div className="card-meta"><span>⌖ {project.region}</span><span>{project.milestones.length} etape raportate</span></div>
                <ProjectPanel project={project} user={user} roles={roles} onUpdated={refresh} setError={setError} />
              </article>
            ))}
          </div>
        </section>

        <section className="section submit-section" id="submit">
          <div className="submit-aside">
            <p className="eyebrow">Contributie voluntara</p>
            <h2>Ai observat ceva ce poate fi imbunatatit?</h2>
            <p>Trimite o descriere clara si surse utile. Echipa de triere va verifica domeniul si va cere completari daca este nevoie.</p>
            <ul className="check-list">
              <li><span>✓</span> Nu publica date medicale, adrese de domiciliu sau informatii despre copii.</li>
              <li><span>✓</span> Alege daca propunerea este publica, pseudonima sau privata.</li>
              <li><span>✓</span> O raportare nu creeaza automat un proiect sau o decizie publica.</li>
            </ul>
          </div>
          <form className="form-card" onSubmit={(event) => void submitProblem(event)}>
            <div className="form-head"><span className="form-step">01 / 03</span><h3>Descrie problema</h3><p>Contul tau si adresa de email nu sunt afisate public.</p></div>
            {!user && <div className="signin-callout"><span>◈</span><div><strong>Autentificarea este necesara pentru trimitere</strong><small>Citirea paginii ramane publica. Poti crea un cont voluntar.</small></div><button className="text-link" type="button" onClick={() => void startSignIn()}>Conectare →</button></div>}
            <label>Titlu scurt<input name="title" required minLength={8} maxLength={160} placeholder="Ex. Trotuar inaccesibil langa scoala" /></label>
            <div className="form-row">
              <label>Domeniu<select name="sector" required defaultValue=""><option value="" disabled>Alege un domeniu</option>{sectors.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label>Judet sau regiune<input name="region" required minLength={2} maxLength={100} placeholder="Ex. Cluj" /></label>
            </div>
            <label>Descriere<textarea name="summary" required minLength={20} maxLength={3000} rows={4} placeholder="Ce se intampla, unde la nivel de regiune si ce efect are?" /></label>
            <label>Vizibilitate<select name="visibility" defaultValue="PSEUDONYMOUS"><option value="PSEUDONYMOUS">Publica anonim, fara numele contului</option><option value="PRIVATE">Privata, doar pentru mine si revizori</option></select></label>
            <p className="form-footnote">Rapoartele publice apar doar dupa verificare si deschiderea discutiei de catre un revizor. O raportare privata ramane restrictionata.</p>
            <label className="consent-row"><input name="consent" type="checkbox" required /><span>Inteleg scopul trimiterii si aleg vizibilitatea de mai sus. Nu includ date personale despre alte persoane.</span></label>
            <button className="button button-primary button-wide" disabled={busy || !user}>{busy ? "Se trimite..." : user ? "Trimite pentru triere" : "Conecteaza-te pentru trimitere"} <span aria-hidden="true">→</span></button>
            <p className="form-footnote">Acest prototip este pentru dezvoltare locala. Nu trimite informatii sensibile sau date personale despre alte persoane.</p>
          </form>
        </section>

        <section className="section workflow-section" id="how">
          <div className="section-heading centered">
            <div><p className="eyebrow">Un proces care poate fi verificat</p><h2>Fiecare pas are un responsabil</h2><p className="section-intro">Datele pot cere o analiza. O institutie competenta decide daca si cum se actioneaza.</p></div>
          </div>
          <div className="workflow-steps">
            {[
              ["01", "Observa", "Descrie o problema cu domeniu si regiune, fara detalii personale inutile."],
              ["02", "Verifica", "Revizorii verifica sursele, incertitudinea si posibilitatea de corectare."],
              ["03", "Compara", "Cetatenii pot propune optiuni, riscuri si rezultate asteptate."],
              ["04", "Autorizeaza", "Un responsabil institutional inregistreaza autoritatea si finantarea."],
              ["05", "Evalueaza", "Milestone-urile si efectele proiectului raman vizibile si contestabile."]
            ].map(([number,title,copy]) => <div className="workflow-step" key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></div>)}
          </div>
        </section>
      </main>}

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <div className="modal-header">
              <div><span className="sector-label">{sectors.find(([value]) => value === selected.sector)?.[1] ?? selected.sector}</span><span className={`status-pill status-${selected.status.toLowerCase()}`}>{statusLabels[selected.status]}</span></div>
              <button className="close-button" onClick={() => setSelected(null)} aria-label="Inchide detaliile">×</button>
            </div>
            <h2 id="detail-title">{selected.title}</h2>
            <p className="detail-meta">{selected.region} · Trimisa la {formatDate(selected.createdAt)} · Vizibilitate: {selected.visibility === "PRIVATE" ? "privata" : selected.visibility === "PSEUDONYMOUS" ? "pseudonima" : "publica"}</p>
            <p className="detail-summary">{selected.summary}</p>
            {selected.permissions?.canReview && <ReviewerPanel problem={selected} user={user} onUpdated={async (updated) => { setSelected(updated); await refresh(); }} setError={setError} setNotice={setNotice} />}
            <div className="detail-columns">
              <div>
                <div className="detail-heading"><h3>Dovezi si surse</h3><span>{selected.evidence.length}</span></div>
                {selected.evidence.map((item) => <article className="evidence-item" key={item.id}><strong>{item.sourceName}</strong><p>{item.description}</p>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer">Deschide sursa ↗</a>}<small>Incredere: {item.confidence.toLowerCase()} · {formatDate(item.createdAt)}</small></article>)}
                {selected.evidence.length === 0 && <p className="muted-copy">Nu au fost adaugate surse inca.</p>}
                {user && selected.visibility !== "PRIVATE" && <EvidenceForm busy={busy} onSubmit={submitEvidence} />}
              </div>
              <div>
                <div className="detail-heading"><h3>Optiuni de rezolvare</h3><span>{selected.options.length}</span></div>
                {selected.options.map((option) => <article className="option-item" key={option.id}><strong>{option.title}</strong><p>{option.summary}</p><small>Rezultat asteptat</small><p>{option.expectedOutcome}</p><small>Riscuri de verificat</small><p>{option.riskNotes}</p></article>)}
                {selected.options.length === 0 && <p className="muted-copy">Solutiile pot fi propuse dupa ce problema intra in analiza.</p>}
                {user && ["UNDER_REVIEW", "DISCUSSION", "OPTIONS"].includes(selected.status) && <OptionForm busy={busy} onSubmit={submitOption} />}
              </div>
            </div>
            {selected.permissions?.canAppeal && user && <AppealForm problemId={selected.id} user={user} onUpdated={setSelected} setError={setError} setNotice={setNotice} />}
            {selected.appeals && selected.appeals.length > 0 && <div className="appeal-list"><h3>Contestatii si decizii</h3>{selected.appeals.map((appeal) => <article key={appeal.id}><span className="status-pill">{appeal.status.replaceAll("_", " ")}</span><p>{appeal.reason}</p>{appeal.decision && <p><strong>Decizie independenta:</strong> {appeal.decision}</p>}</article>)}</div>}
            {selected.status === "OPTIONS" && user && <ProjectProposalForm problem={selected} busy={busy} onSubmit={proposeProject} />}
          </section>
        </div>
      )}
      <footer className="footer"><a className="brand" href="#"><span className="brand-mark">P</span><span>polis<span className="brand-os">OS</span></span></a><p>O infrastructura civica voluntara, transparenta si revizuibila.</p><button onClick={() => setPage(page === "national" ? "citizen" : page === "citizen" ? "workflow" : "national")}>{page === "national" ? "Economia cetățeanului" : page === "citizen" ? "Probleme si proiecte" : "Sisteme nationale"} <span aria-hidden="true">↑</span></button></footer>
    </div>
  );
}

function ReviewerPanel({ problem, user, onUpdated, setError, setNotice }: {
  problem: Problem; user: User | null;
  onUpdated: (problem: Problem) => Promise<void> | void;
  setError: (value: string) => void; setNotice: (value: string) => void;
}) {
  const [status, setStatus] = useState<ProblemStatus>(problem.status);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const nextOptions = reviewTransitions[problem.status];
  const reviewableAppeals = (problem.appeals ?? []).filter((appeal) => appeal.status === "FILED" || appeal.status === "IN_REVIEW");
  useEffect(() => setStatus(problem.status), [problem.id, problem.status]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      await api.reviewProblem(problem.id, status, reason, user);
      const updated = await api.getProblem(problem.id, user);
      await onUpdated(updated);
      setNotice(`Status actualizat: ${statusLabels[status]}.`);
      setReason("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Statusul nu a putut fi actualizat.");
    } finally {
      setBusy(false);
    }
  };
  if (!nextOptions.length && !reviewableAppeals.length) return null;
  return <div className="reviewer-tools">
    {nextOptions.length > 0 && <form className="review-panel" onSubmit={(event) => void submit(event)}>
      <div><strong>Panou revizor</strong><small>Actiunile sunt inregistrate cu motiv si rol.</small></div>
      <select value={status} onChange={(event) => setStatus(event.target.value as ProblemStatus)} aria-label="Status nou">{nextOptions.map((option) => <option key={option} value={option}>{statusLabels[option]}</option>)}</select>
      <input value={reason} onChange={(event) => setReason(event.target.value)} required minLength={8} maxLength={1200} placeholder="Motivul schimbarii de status" />
      <button className="button button-small button-primary" disabled={busy}>{busy ? "Se salveaza..." : "Inregistreaza"}</button>
    </form>}
    {reviewableAppeals.map((appeal) => <AppealReviewForm key={appeal.id} problemId={problem.id} appeal={appeal} user={user} onUpdated={onUpdated} setError={setError} setNotice={setNotice} />)}
  </div>;
}

function AppealReviewForm({ problemId, appeal, user, onUpdated, setError, setNotice }: {
  problemId: string; appeal: ProblemAppeal; user: User | null;
  onUpdated: (problem: Problem) => Promise<void> | void; setError: (value: string) => void; setNotice: (value: string) => void;
}) {
  const [status, setStatus] = useState<"UPHELD" | "RETURNED_FOR_REVIEW" | "DISMISSED">("RETURNED_FOR_REVIEW");
  const [decision, setDecision] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      await api.resolveProblemAppeal(problemId, appeal.id, status, decision, user);
      await onUpdated(await api.getProblem(problemId, user));
      setNotice("Contestatia a fost decisa independent si motivul a fost inregistrat.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Contestatia nu a putut fi decisa.");
    } finally {
      setBusy(false);
    }
  };
  return <form className="review-panel appeal-review" onSubmit={(event) => void submit(event)}>
    <div><strong>Revizuieste contestatia</strong><small>Revizorul trebuie sa fie independent de autor si de revizorii initiali.</small></div>
    <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label="Decizia contestatiei">
      <option value="UPHELD">Admite contestatia</option>
      <option value="RETURNED_FOR_REVIEW">Retrimite la analiza</option>
      <option value="DISMISSED">Respinge contestatia</option>
    </select>
    <textarea value={decision} onChange={(event) => setDecision(event.target.value)} required minLength={10} maxLength={1200} rows={3} placeholder="Explica decizia si urmatorul pas" />
    <button className="button button-small button-primary" disabled={busy}>{busy ? "Se salveaza..." : "Inregistreaza decizia"}</button>
  </form>;
}

function EvidenceForm({ busy, onSubmit }: { busy: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form className="inline-form" onSubmit={(event) => void onSubmit(event)}>
    <h4>Adauga o sursa</h4>
    <label>Numele sursei<input name="sourceName" required minLength={2} maxLength={160} placeholder="Raport, institutie sau observatie" /></label>
    <label>Link public (optional)<input name="sourceUrl" type="url" maxLength={2048} placeholder="https://" /></label>
    <label>Ce sustine sursa<textarea name="description" required minLength={10} maxLength={1500} rows={3} /></label>
    <label className="consent-row"><input name="consent" type="checkbox" required /><span>Aleg sa atasez aceasta sursa problemei. Se aplica vizibilitatea aleasa pentru problema.</span></label>
    <label>Increderea ta<select name="confidence" defaultValue="UNASSESSED"><option value="UNASSESSED">Nu a fost evaluata</option><option value="LOW">Redusa</option><option value="MEDIUM">Medie</option><option value="HIGH">Ridicata</option></select></label>
    <button className="button button-outline" disabled={busy}>Adauga sursa</button>
  </form>;
}

function OptionForm({ busy, onSubmit }: { busy: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form className="inline-form" onSubmit={(event) => void onSubmit(event)}>
    <h4>Propune o optiune</h4>
    <label>Titlu<input name="title" required minLength={4} maxLength={160} /></label>
    <label>Descriere<textarea name="summary" required minLength={15} maxLength={2000} rows={3} /></label>
    <label>Rezultat asteptat<textarea name="expectedOutcome" required minLength={8} maxLength={1200} rows={2} /></label>
    <label>Riscuri si necunoscute<textarea name="riskNotes" required minLength={4} maxLength={1200} rows={2} /></label>
    <button className="button button-outline" disabled={busy}>Trimite optiunea</button>
  </form>;
}

function ProjectProposalForm({ problem, busy, onSubmit }: {
  problem: Problem; busy: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return <form className="project-proposal-form" onSubmit={(event) => void onSubmit(event)}>
    <div><p className="eyebrow">Urmatorul prag</p><h3>Propune un proiect</h3><p>Propunerea ramane neautorizata pana cand un responsabil institutional confirma baza legala si finantarea.</p></div>
    <input type="hidden" name="problemId" value={problem.id} />
    <label>Titlul proiectului<input name="title" required minLength={8} maxLength={160} /></label>
    <label>Scop si rezultate<textarea name="summary" required minLength={20} maxLength={2000} rows={3} /></label>
    <button className="button button-primary" disabled={busy}>Propune proiectul →</button>
  </form>;
}

function ProjectPanel({ project, user, roles, onUpdated, setError }: {
  project: Project; user: User | null; roles: string[];
  onUpdated: () => Promise<void>; setError: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [appeal, setAppeal] = useState("");
  const [projectAppeals, setProjectAppeals] = useState<ProjectAppeal[]>([]);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");
  const [authority, setAuthority] = useState({ institutionName: "", authorityReference: "", fundingReference: "", decisionReason: "" });
  const mayAuthorize = roles.includes("project-owner") && project.status === "PROPOSED";
  useEffect(() => {
    if (!expanded || !user) return;
    void api.listProjectAppeals(project.id, user).then((result) => setProjectAppeals(result.items)).catch((reason) => {
      setError(reason instanceof Error ? reason.message : "Contestatiile nu au putut fi incarcate.");
    });
  }, [expanded, project.id, user, setError]);
  const submit = async (operation: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setError("");
    try {
      await operation();
      setNotice(success);
      await onUpdated();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Actiunea nu a putut fi salvata.");
    } finally {
      setBusy(false);
    }
  };
  return <div className="project-actions">
    <button className="text-link" onClick={() => setExpanded(!expanded)}>{expanded ? "Ascunde detalii ↑" : "Detalii si participare ↓"}</button>
    {expanded && <div className="project-expanded">
      {notice && <p className="inline-success">{notice}</p>}
      {project.status === "PROPOSED" && <p className="proposal-warning">Propunere civica: nu reprezinta aprobare, buget sau angajament al unei institutii.</p>}
      {user && project.status !== "COMPLETED" && project.status !== "STOPPED" && <button className="button button-outline button-small" disabled={busy} onClick={() => void submit(() => api.joinProject(project.id, user), "Te-ai alaturat cu un rol de contributie limitat la acest proiect.")}>Alatura-te voluntar</button>}
      {mayAuthorize && user && <div className="authorization-box">
        <h4>Inregistreaza autorizarea institutionala</h4>
        <p>Verifica documentele in afara platformei. Acest formular pastreaza referintele si motivul, dar nu le valida legal.</p>
        <label>Institutia responsabila<input value={authority.institutionName} onChange={(e) => setAuthority({ ...authority, institutionName: e.target.value })} /></label>
        <label>Referinta de autoritate<input value={authority.authorityReference} onChange={(e) => setAuthority({ ...authority, authorityReference: e.target.value })} /></label>
        <label>Referinta de finantare<input value={authority.fundingReference} onChange={(e) => setAuthority({ ...authority, fundingReference: e.target.value })} /></label>
        <label>Motiv si decizie<textarea value={authority.decisionReason} onChange={(e) => setAuthority({ ...authority, decisionReason: e.target.value })} rows={3} /></label>
        <button className="button button-primary button-small" disabled={busy || Object.values(authority).some((value) => value.trim().length < 4)} onClick={() => user && void submit(() => api.authorizeProject(project.id, authority, user), "Autorizarea si referintele de resurse au fost inregistrate.")}>Activeaza proiectul</button>
      </div>}
      {project.status === "ACTIVE" && user && <form className="inline-form milestone-form" onSubmit={(event) => {
        event.preventDefault();
        void submit(() => api.addMilestone(project.id, { title: milestoneTitle, description: milestoneDescription }, user), "Etapa a fost raportata si este etichetata ca auto-raportata.");
        setMilestoneTitle("");
        setMilestoneDescription("");
      }}>
        <h4>Raporteaza o etapa</h4>
        <label>Titlu<input value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} required minLength={4} maxLength={160} /></label>
        <label>Progres, dovezi si blocaje<textarea value={milestoneDescription} onChange={(e) => setMilestoneDescription(e.target.value)} required minLength={10} maxLength={1600} rows={3} /></label>
        <button className="button button-outline button-small" disabled={busy}>Trimite raport</button>
      </form>}
      {project.milestones.length > 0 && <div className="milestones"><h4>Etape raportate</h4>{project.milestones.map((milestone) => <article key={milestone.id} className="milestone"><span className={`milestone-status milestone-${milestone.status.toLowerCase()}`}>{milestone.status === "REPORTED" ? "Auto-raportat" : milestone.status}</span><strong>{milestone.title}</strong><p>{milestone.description}</p><small>{formatDate(milestone.reportedAt)}</small></article>)}</div>}
      {user && <form className="inline-form appeal-project" onSubmit={(event) => {
        event.preventDefault();
        void submit(async () => {
          await api.appealProject(project.id, appeal, user);
          setProjectAppeals((await api.listProjectAppeals(project.id, user)).items);
          setAppeal("");
        }, "Contestatia a fost inregistrata pentru revizuire.");
      }}><h4>Contesta o informatie</h4><textarea value={appeal} onChange={(e) => setAppeal(e.target.value)} required minLength={10} maxLength={2000} rows={2} placeholder="Descrie ce informatie sau decizie vrei sa fie revizuita." /><button className="button button-outline button-small" disabled={busy}>Trimite contestatia</button></form>}
      {projectAppeals.length > 0 && <div className="appeal-list"><h4>Contestatii si decizii</h4>{projectAppeals.map((item) => <article key={item.id}><span className="status-pill">{item.status.replaceAll("_", " ")}</span><p>{item.reason}</p>{item.decision && <p><strong>Decizie independenta:</strong> {item.decision}</p>}{roles.includes("reviewer") && (item.status === "FILED" || item.status === "IN_REVIEW") && user && <ProjectAppealReviewForm projectId={project.id} appeal={item} user={user} onUpdated={async () => { setProjectAppeals((await api.listProjectAppeals(project.id, user)).items); await onUpdated(); }} setError={setError} />}</article>)}</div>}
    </div>}
  </div>;
}

function ProjectAppealReviewForm({ projectId, appeal, user, onUpdated, setError }: {
  projectId: string; appeal: ProjectAppeal; user: User;
  onUpdated: () => Promise<void>; setError: (value: string) => void;
}) {
  const [status, setStatus] = useState<"UPHELD" | "RETURNED_FOR_REVIEW" | "DISMISSED">("RETURNED_FOR_REVIEW");
  const [decision, setDecision] = useState("");
  const [busy, setBusy] = useState(false);
  return <form className="appeal-review-form" onSubmit={(event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    void api.resolveProjectAppeal(projectId, appeal.id, status, decision, user).then(onUpdated)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Contestatia nu a putut fi decisa."))
      .finally(() => setBusy(false));
  }}>
    <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label="Decizia contestatiei">
      <option value="UPHELD">Admite contestatia</option><option value="RETURNED_FOR_REVIEW">Retrimite la analiza</option><option value="DISMISSED">Respinge contestatia</option>
    </select>
    <textarea value={decision} onChange={(event) => setDecision(event.target.value)} required minLength={10} maxLength={1200} rows={3} placeholder="Motivul deciziei independente" />
    <button className="button button-small button-primary" disabled={busy}>{busy ? "Se salveaza..." : "Inregistreaza decizia"}</button>
  </form>;
}

function AppealForm({ problemId, user, onUpdated, setError, setNotice }: {
  problemId: string; user: User; onUpdated: (problem: Problem) => void; setError: (value: string) => void; setNotice: (value: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  return <form className="appeal-form" onSubmit={(event) => {
    event.preventDefault();
    setBusy(true);
    void api.appealProblem(problemId, reason, user).then(async () => {
      setNotice("Contestatia a fost inregistrata.");
      setReason("");
      onUpdated(await api.getProblem(problemId, user));
    }).catch((problem) => setError(problem instanceof Error ? problem.message : "Contestatia nu a putut fi trimisa."))
      .finally(() => setBusy(false));
  }}>
    <label>Contesta o etapa sau o decizie<textarea value={reason} onChange={(event) => setReason(event.target.value)} required minLength={10} maxLength={2000} rows={3} /></label>
    <button className="button button-outline" disabled={busy}>Trimite contestatia</button>
  </form>;
}

export default App;

