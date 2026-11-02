import { FormEvent, useMemo, useState } from "react";

type ModuleId = "overview" | "domains" | "debates" | "people" | "prices" | "jobs" | "food" | "supply" | "tourism" | "time";
type Side = "PRO" | "CON";

interface Argument {
  id: string;
  side: Side;
  title: string;
  body: string;
  source: string;
  supportCount: number;
  supportedBy: string[];
  isLocal: boolean;
  reviewExample?: { facts: string; assumptions: string; reasoning: string; conduct: string; note: string };
}

interface Debate {
  id: string;
  title: string;
  question: string;
  domain: string;
  closesAt: string;
  arguments: Argument[];
}

const storageKey = "polisos.demo-debates.v1";
const localParticipant = "browser-demo-participant";

const initialDebates: Debate[] = [
  {
    id: "commute-hours",
    title: "Coordonarea programului serviciilor cu orele de varf",
    question: "Ar trebui testate programe diferite pentru scoli, transport si servicii publice, la nivel local?",
    domain: "Transport · Educatie · Servicii publice",
    closesAt: "Consultare deschisa · exemplu demonstrativ",
    arguments: [
      {
        id: "commute-pro-1", side: "PRO", title: "Un pilot etapizat poate reduce aglomeratia dintr-o singura fereastra orara.",
        body: "Daca institutiile locale isi coordoneaza deschiderea si inchiderea, o parte din calatorii se pot muta in afara varfului. Ar trebui masurat timpul de calatorie si efectul asupra familiilor inainte de extindere.",
        source: "Ipoteza de testat: date anonimizate de validare si timpi de parcurs, publicati de operatori.", supportCount: 24, supportedBy: [], isLocal: false,
        reviewExample: { facts: "Efect propus, neconfirmat", assumptions: "Programul poate fi schimbat local", reasoning: "Necesita pilot si grup de comparatie", conduct: "Nu este evidentiat un atac personal", note: "Exemplu predefinit. Cere date comparabile pentru a verifica ipoteza." }
      },
      {
        id: "commute-con-1", side: "CON", title: "Programul fix al angajatilor si ingrijirea copiilor pot face schimbarea costisitoare.",
        body: "Mutarea orelor poate transfera costul catre parinti, lucratori in ture si persoane care schimba mai multe mijloace de transport. Un pilot trebuie sa includa aceste grupuri si sa masoare accesul, nu doar viteza traficului.",
        source: "Necunoscuta: distributia programelor de munca si a responsabilitatilor de ingrijire pe regiune.", supportCount: 19, supportedBy: [], isLocal: false,
        reviewExample: { facts: "Premisa cere date reprezentative", assumptions: "Efectul poate varia intre gospodarii", reasoning: "Impactul este plauzibil, dar necuantificat", conduct: "Nu este evidentiat un atac personal", note: "Ar fi utila evaluarea separata a parintilor, lucratorilor in ture si navetistilor." }
      }
    ]
  },
  {
    id: "building-energy",
    title: "Renovare energetica sau capacitati noi mai intai?",
    question: "Cum ar trebui echilibrate economiile prin eficienta si investitiile noi in energie?",
    domain: "Energie · Locuinte · Finante publice",
    closesAt: "Consultare deschisa · exemplu demonstrativ",
    arguments: [
      {
        id: "energy-pro-1", side: "PRO", title: "Reducerea pierderilor poate elibera capacitate pentru gospodarii si industrie.",
        body: "Cladirile cu pierderi mari pot necesita mai putina energie dupa renovare. Efectul depinde de cost, calitatea executiei, vreme si comportamentul ocupantilor; trebuie urmarit consumul masurat, nu economiile promise.",
        source: "Sursa necesara: consum agregat inainte/dupa, metoda si conditii comparabile.", supportCount: 31, supportedBy: [], isLocal: false,
        reviewExample: { facts: "Economiile trebuie masurate", assumptions: "Cladiri si conditii comparabile", reasoning: "Cauzalitatea necesita metoda inainte/dupa", conduct: "Nu este evidentiat un atac personal", note: "Nu confunda economia proiectata cu cea observata; publica intervalul si metoda." }
      },
      {
        id: "energy-con-1", side: "CON", title: "Renovarea lenta nu poate inlocui investitiile necesare pentru siguranta alimentarii.",
        body: "Economiile viitoare nu rezolva automat blocajele de retea sau varfurile de cerere de maine. Optiunile trebuie comparate pe cost total, timp de construire, flexibilitate si efect asupra facturii.",
        source: "Intrebare de verificat: care este costul total si timpul de livrare pentru fiecare optiune?", supportCount: 16, supportedBy: [], isLocal: false,
        reviewExample: { facts: "Cost si calendar lipsesc", assumptions: "Optiunile pot fi comparate pe aceeasi baza", reasoning: "Cere cost total si scenarii comune", conduct: "Nu este evidentiat un atac personal", note: "Argumentul ridica un compromis, dar lipsesc valori si termene pentru comparatie." }
      }
    ]
  }
];

const modules: { id: ModuleId; label: string; icon: string; description: string }[] = [
  { id: "overview", label: "Imagine nationala", icon: "◫", description: "Sinteza sistemelor" },
  { id: "domains", label: "Harta D01–D20", icon: "▦", description: "Toate domeniile nationale" },
  { id: "debates", label: "Dezbateri si dovezi", icon: "⇄", description: "Argumente, surse, evaluare" },
  { id: "people", label: "Capacitate profesionala", icon: "◎", description: "Specialisti si acoperire" },
  { id: "prices", label: "Preturi si accesibilitate", icon: "¤", description: "Bunuri si servicii esentiale" },
  { id: "jobs", label: "Munca si oportunitati", icon: "↗", description: "Posturi, competente, afaceri" },
  { id: "food", label: "Agricultura si hrana", icon: "⌁", description: "Productie, intrari si rezilienta" },
  { id: "supply", label: "Productie si comert", icon: "⌁", description: "Import, transformare, export" },
  { id: "tourism", label: "Turism si locuri", icon: "⌖", description: "Atractii si capacitate locala" },
  { id: "time", label: "Timp si servicii", icon: "◷", description: "Cerere agregata, program public" }
];

function readDebates(): Debate[] {
  try {
    const value = localStorage.getItem(storageKey);
    if (!value) return initialDebates;
    const parsed = JSON.parse(value) as Debate[];
    return Array.isArray(parsed) ? parsed : initialDebates;
  } catch {
    return initialDebates;
  }
}

function saveDebates(items: Debate[]) {
  try { localStorage.setItem(storageKey, JSON.stringify(items)); } catch { /* preview remains usable for this page load */ }
}

export function ControlRoom({ canParticipate, onEnterDemo, onOpenWorkflow }: {
  canParticipate: boolean;
  onEnterDemo: () => void;
  onOpenWorkflow: () => void;
}) {
  const [activeModule, setActiveModule] = useState<ModuleId>("overview");
  const [debates, setDebates] = useState<Debate[]>(readDebates);
  const [activeDebateId, setActiveDebateId] = useState(initialDebates[0].id);
  const [notice, setNotice] = useState("");
  const activeDebate = debates.find((debate) => debate.id === activeDebateId) ?? debates[0];

  const updateDebates = (update: (items: Debate[]) => Debate[]) => {
    setDebates((current) => {
      const next = update(current);
      saveDebates(next);
      return next;
    });
  };

  const resetDebateData = () => {
    localStorage.removeItem(storageKey);
    setDebates(initialDebates);
    setActiveDebateId(initialDebates[0].id);
    setNotice("Discutiile demo au fost resetate in browserul local.");
  };

  const addArgument = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canParticipate || !activeDebate) return;
    const form = new FormData(event.currentTarget);
    const argument: Argument = {
      id: crypto.randomUUID(),
      side: String(form.get("side")) as Side,
      title: String(form.get("title")).trim(),
      body: String(form.get("body")).trim(),
      source: String(form.get("source")).trim() || "Nicio sursa atasata; afirmatia asteapta dovezi.",
      supportCount: 0,
      supportedBy: [],
      isLocal: true
    };
    updateDebates((items) => items.map((debate) => debate.id === activeDebate.id
      ? { ...debate, arguments: [...debate.arguments, argument] }
      : debate));
    event.currentTarget.reset();
    setNotice("Argument adaugat numai in datele locale ale acestui browser.");
  };

  const toggleSupport = (argumentId: string) => {
    if (!canParticipate) return;
    updateDebates((items) => items.map((debate) => debate.id !== activeDebate?.id ? debate : {
      ...debate,
      arguments: debate.arguments.map((argument) => {
        if (argument.id !== argumentId) return argument;
        const alreadySupported = argument.supportedBy.includes(localParticipant);
        return {
          ...argument,
          supportCount: Math.max(0, argument.supportCount + (alreadySupported ? -1 : 1)),
          supportedBy: alreadySupported
            ? argument.supportedBy.filter((person) => person !== localParticipant)
            : [...argument.supportedBy, localParticipant]
        };
      })
    }));
  };

  return <main className="os-console">
    <section className="os-heading">
      <div>
        <p className="os-eyebrow"><span className="live-dot" /> POLISOS / NATIONAL OPERATING PICTURE</p>
        <h1>Starea tarii, pe sisteme.</h1>
        <p>Un tablou de lucru pentru observatii, dezbateri, capacitate, servicii si rezultate. Fiecare semnal are sursa, vechime si limite.</p>
      </div>
      <div className="as-of-card"><span>MEDIU</span><strong>Previzualizare locala</strong><small>Fluxuri nationale reale conectate: 0</small></div>
    </section>

    <div className="os-data-warning"><strong>Date demonstrative.</strong> Valorile, graficele si discutiile de pe ecran sunt inventate pentru prototip; nu descriu situatia curenta din Romania si nu conduc decizii publice.</div>
    {!canParticipate && <div className="os-participation-callout"><div><strong>Vrei sa contribui la dezbatere?</strong><span>Intra in sesiunea demo ca sa adaugi un argument sau sa sustii unul existent. Modificarile raman in acest browser.</span></div><button className="button button-primary button-small" onClick={onEnterDemo}>Intra ca cetatean demo</button></div>}
    {notice && <div className="os-local-notice" role="status">{notice}<button onClick={() => setNotice("")}>Inchide</button></div>}

    <div className="os-layout">
      <nav className="os-rail" aria-label="Sisteme PolisOS">
        <p className="os-rail-title">Sisteme</p>
        {modules.map((module) => <button key={module.id} className={`os-rail-item ${activeModule === module.id ? "selected" : ""}`} onClick={() => { setActiveModule(module.id); setNotice(""); }}>
          <span className="os-rail-icon">{module.icon}</span><span><strong>{module.label}</strong><small>{module.description}</small></span>
        </button>)}
        <div className="os-rail-divider" />
        <button className="os-rail-item workflow-link" onClick={onOpenWorkflow}><span className="os-rail-icon">⌘</span><span><strong>Probleme si proiecte</strong><small>Flux civic operational</small></span></button>
        <div className="os-rail-footer"><span className="status-dot gray" /> Fara integrari nationale active</div>
      </nav>

      <div className="os-workspace">
        {activeModule === "overview" && <Overview onSelect={setActiveModule} onOpenWorkflow={onOpenWorkflow} />}
        {activeModule === "domains" && <DomainDirectory />}
        {activeModule === "debates" && <Debates debates={debates} activeDebate={activeDebate} onSelectDebate={setActiveDebateId} onAddArgument={addArgument} onSupport={toggleSupport} onResetDemo={resetDebateData} canParticipate={canParticipate} onEnterDemo={onEnterDemo} />}
        {activeModule === "people" && <SpecialistCapacity />}
        {activeModule === "prices" && <PriceObservatory />}
        {activeModule === "jobs" && <JobsAndSkills />}
        {activeModule === "food" && <AgricultureAndFood />}
        {activeModule === "supply" && <TradeAndSupply />}
        {activeModule === "tourism" && <Tourism />}
        {activeModule === "time" && <TimeUse />}
      </div>
    </div>
  </main>;
}

function ModuleHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div className="module-heading"><p className="os-eyebrow">{eyebrow}</p><h2>{title}</h2><p>{copy}</p></div>;
}

function Overview({ onSelect, onOpenWorkflow }: { onSelect: (id: ModuleId) => void; onOpenWorkflow: () => void }) {
  const cards: { id: ModuleId; code: string; title: string; state: string; detail: string }[] = [
    { id: "people", code: "D09", title: "Oameni si competente", state: "Model agregat", detail: "Specialitati, regiune, flux de formare" },
    { id: "prices", code: "D04", title: "Costul vietii", state: "Sursa neconectata", detail: "Bunuri, utilitati si servicii de baza" },
    { id: "jobs", code: "D04", title: "Munca si oportunitati", state: "Sursa neconectata", detail: "Posturi, competente cerute, angajatori" },
    { id: "food", code: "D04 · D08", title: "Agricultura si hrana", state: "Blueprint de sistem", detail: "Intrari, productie, depozitare, acces" },
    { id: "supply", code: "D07", title: "Productie si comert", state: "Pilot de modelare", detail: "Origine, transformare, import si export" },
    { id: "tourism", code: "D04", title: "Turism si economie locala", state: "Sursa neconectata", detail: "Sezonalitate, capacitate, accesibilitate" },
    { id: "time", code: "D05", title: "Programul serviciilor", state: "Semnal agregat demo", detail: "Ore de varf si ferestre de acces" }
  ];
  return <>
    <div className="module-topline"><div><p className="os-eyebrow">Control room / Sinteza</p><h2>Bucla de operare publica</h2></div><span className="status-chip status-chip-warn">PROTOTIP · FARA COMANDA AUTOMATA</span></div>
    <div className="os-kpi-grid">
      <Kpi label="Domenii in blueprint" value="20" detail="Fiecare cu proprietar si masuratori" />
      <Kpi label="Module de sistem in prototip" value="10" detail="Interfete demonstrative, nu servicii" />
      <Kpi label="Fluxuri nationale conectate" value="0" detail="Nicio sursa live sau institutionala" />
      <Kpi label="Decizii automate" value="0" detail="Masurile cer analiza umana" />
    </div>
    <div className="os-overview-grid">
      <section className="os-panel control-loop-panel">
        <PanelTitle label="FEEDBACK LOOP" title="Observe → understand → improve" />
        <div className="loop-list">{[
          ["01", "Observa", "Sursa, data colectarii si permisiunea"],
          ["02", "Masura", "Unitate, acoperire, incertitudine"],
          ["03", "Diagnosticheaza", "Probleme si cauze posibile; nu vinovati"],
          ["04", "Compara", "Optiuni, costuri, beneficii, efecte secundare"],
          ["05", "Autorizeaza", "Institutie competenta, motiv si temei"],
          ["06", "Livreaza si invata", "Responsabili, jaloane, rezultat, corectie"]
        ].map(([n, title, copy]) => <div className="loop-step" key={n}><span>{n}</span><div><strong>{title}</strong><small>{copy}</small></div><span className="loop-arrow">→</span></div>)}</div>
        <p className="panel-footnote">Controlul se aplica serviciilor si proiectelor. Oamenii nu sunt senzori sau KPI-uri individuale.</p>
      </section>
      <section className="os-panel signal-panel">
        <PanelTitle label="OBSERVABILITATE" title="Ce stim si ce nu stim" />
        <div className="signal-summary"><span className="signal-glyph">⌁</span><div><strong>Acest tablou nu are acces la sisteme nationale.</strong><p>Datele de mai jos sunt mostre locale. O conectare reala cere proprietar, sursa, scop, licenta, frecventa si proces de corectare.</p></div></div>
        {[ ["Surse cu provenienta", "0 / 0", "unknown"], ["Indicatori publici definiti", "0", "unknown"], ["Alerte validate de un om", "0", "good"] ].map(([label,value,status]) => <div className="signal-row" key={label}><span className={`status-dot ${status === "good" ? "green" : "gray"}`} />{label}<strong>{value}</strong></div>)}
        <button className="text-button" onClick={onOpenWorkflow}>Deschide fluxul de probleme si proiecte <span>→</span></button>
      </section>
    </div>
    <section className="os-panel system-map-panel">
      <PanelTitle label="SISTEME DE LUCRU" title="Domenii care se influenteaza reciproc" />
      <div className="system-card-grid">{cards.map((card) => <button className="system-card" key={card.id} onClick={() => onSelect(card.id)}>
        <div><span>{card.code}</span><span className="system-arrow">↗</span></div><h3>{card.title}</h3><p>{card.detail}</p><small><span className="status-dot gray" />{card.state}</small>
      </button>)}</div>
    </section>
    <section className="os-panel integration-queue-panel">
      <PanelTitle label="INTEGRATION QUEUE · UNASSIGNED" title="Ce trebuie conectat inainte sa numim asta monitorizare" />
      <p className="integration-intro">Fiecare rand necesita un proprietar institutional, permisiune de utilizare, contract de date si verificari de calitate.</p>
      <div className="integration-rows">{[
        ["D04 · D12", "Preturi si cos de baza", "Tarife publice + serii de piata licentiate", "prices"],
        ["D09 · D10", "Capacitate profesionala", "Registre profesionale + agregate de la unitati", "people"],
        ["D04 · D09", "Posturi si competente", "Anunturi de angajare verificabile si programe de formare", "jobs"],
        ["D04 · D07", "Agricultura si lanturi", "Productie, depozitare, inputuri si comert agregat", "food"],
        ["D05 · D06", "Cerere pentru servicii", "Accesari agregate, program, asteptare si accesibilitate", "time"]
      ].map(([domains, item, needed, target]) => <button className="integration-row" key={item} onClick={() => onSelect(target as ModuleId)}><span className="integration-domain">{domains}</span><strong>{item}</strong><span>{needed}</span><em>Neconectat</em><b>→</b></button>)}</div>
    </section>
    <section className="os-panel launch-panel"><div><p className="os-eyebrow">PARTICIPARE CIVICA</p><h2>Semnal → dezbatere → proiect → evaluare</h2><p>O imagine nationala utila trebuie legata de discutii cu dovezi si de livrarea verificabila a serviciilor.</p></div><div className="launch-actions"><button className="button button-primary" onClick={() => onSelect("debates")}>Deschide dezbaterile</button><button className="button button-outline" onClick={() => onSelect("domains")}>Toate domeniile</button><button className="button button-outline" onClick={onOpenWorkflow}>Probleme si proiecte</button></div></section>
  </>;
}

const countryDomains = [
  ["D01", "Identity and access", "Authentication, permissions, consent and account recovery", "Foundation scaffold"],
  ["D02", "Institutions", "Mandates, service owners, responsibilities and public reporting", "Blueprint"],
  ["D03", "Governance and deliberation", "Topics, consultation, arguments and accountable decisions", "Debate UI prototype"],
  ["D04", "Economy", "Work, enterprises, agriculture, industry, services, tourism and trade", "Sample indicators"],
  ["D05", "Public services", "Health, education, housing, mobility and social support access", "Service view proposal"],
  ["D06", "Infrastructure", "Transport, utilities, connectivity, assets and maintenance", "Blueprint"],
  ["D07", "Supply chains", "Resource inputs, production, logistics, imports and exports", "Chain UI prototype"],
  ["D08", "Environment", "Extraction impacts, emissions, pollution, circularity and repair", "Blueprint"],
  ["D09", "Human development", "Education, health pathways, skills, workforce and inclusion", "Capacity UI prototype"],
  ["D10", "Data and knowledge", "Definitions, provenance, sources, research and corrections", "Catalog specification"],
  ["D11", "AI decision support", "Bounded analysis, source-linked findings and human correction", "Review rubric only"],
  ["D12", "Measurement and evaluation", "Baselines, indicators, uncertainty and outcome evaluation", "Indicator specification"],
  ["D13", "Transparency and audit", "Decision trails, procurement visibility and independent review", "Blueprint"],
  ["D14", "Process and administration", "Applications, workflow routing, permits and appeals", "Problem workflow scaffold"],
  ["D15", "Simulation and digital twin", "Scenario modelling, sensitivity and intervention comparison", "Blueprint"],
  ["D16", "Citizen interface", "Accessible dashboards, discussion, services and corrections", "Control room prototype"],
  ["D17", "Public finance", "Budgets, revenue, spending, procurement and fiscal outcomes", "Blueprint"],
  ["D18", "Justice and jurisprudence", "Legal information, process navigation and lawful referral", "Blueprint"],
  ["D19", "Defense and national security", "Civil preparedness and safe, authorized high-level reporting", "Restricted design"],
  ["D20", "Diplomacy and foreign relations", "Treaties, cooperation, external trade and data exchange", "Blueprint"]
] as const;

function DomainDirectory() {
  const [query, setQuery] = useState("");
  const visibleDomains = countryDomains.filter(([, name, remit]) => `${name} ${remit}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <ModuleHeading eyebrow="D01–D20 · SERVICE OWNERSHIP MAP" title="Tara este o retea de sisteme" copy="Fiecare domeniu are propriul responsabil, date si feedback loop. Harta separa ce este deja prototipat de ce exista numai in blueprint." />
    <div className="os-data-warning"><strong>Stare reala a acestei versiuni:</strong> niciunul dintre aceste domenii nu este conectat la o sursa nationala operationala. Etichetele descriu nivelul software din acest repository.</div>
    <label className="domain-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cauta domeniu sau responsabilitate" /></label>
    <div className="domain-directory-grid">{visibleDomains.map(([code, name, remit, phase]) => <article className="domain-tile" key={code}>
      <div><span className="domain-code">{code}</span><span className={`phase-chip ${phase.toLowerCase().includes("prototype") || phase.toLowerCase().includes("scaffold") ? "phase-demo" : ""}`}>{phase}</span></div>
      <h3>{name}</h3><p>{remit}</p><small><span className="status-dot gray" /> Sursa nationala operationala neconectata</small>
    </article>)}</div>
    <p className="panel-footnote">Blueprint-ul complet pentru fiecare domeniu este in `docs/domains/D01–D20`. Un domeniu trece la operare numai dupa ce are serviciu proprietar, sursa permisa, stack record, siguranta, finantare si suport.</p>
  </>;
}

function Kpi({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="os-kpi"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function PanelTitle({ label, title }: { label: string; title: string }) {
  return <div className="panel-title"><span>{label}</span><h3>{title}</h3></div>;
}

function Debates({ debates, activeDebate, onSelectDebate, onAddArgument, onSupport, onResetDemo, canParticipate, onEnterDemo }: {
  debates: Debate[]; activeDebate?: Debate; onSelectDebate: (id: string) => void;
  onAddArgument: (event: FormEvent<HTMLFormElement>) => void; onSupport: (id: string) => void;
  onResetDemo: () => void; canParticipate: boolean; onEnterDemo: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedArgumentId, setSelectedArgumentId] = useState("");
  const selectedArgument = activeDebate?.arguments.find((argument) => argument.id === selectedArgumentId) ?? activeDebate?.arguments[0];
  const reviewExample = selectedArgument?.reviewExample;
  const proArguments = activeDebate?.arguments.filter((argument) => argument.side === "PRO") ?? [];
  const conArguments = activeDebate?.arguments.filter((argument) => argument.side === "CON") ?? [];
  return <>
    <ModuleHeading eyebrow="D03 GOVERNANCE · D10 KNOWLEDGE · D11 AI SUPPORT" title="Dezbateri cu argumente si surse" copy="Descompune o intrebare publica in afirmatii verificabile. Participantii adauga argumente sau sustin unele existente; sistemul AI viitor va analiza fiecare afirmatie cu sursele la vedere." />
    {canParticipate && <div className="debate-reset-row"><span>Argumentele si sustinerile tale demo se pastreaza doar in acest browser.</span><button className="text-button" onClick={onResetDemo}>Reseteaza dezbaterile demo ↺</button></div>}
    <div className="ai-scope-note"><span>AI</span><div><strong>Rubrica de revizuire propusa · fara model conectat in prototip</strong><p>Analiza viitoare va marca afirmatii verificabile, presupuneri, salturi logice si atacuri personale, va cita sursele folosite si va indica incertitudinea. Nu va hotari adevarul sau politica publica si va permite contestarea de catre oameni.</p></div></div>
    <div className="debate-layout">
      <aside className="debate-list os-panel"><PanelTitle label="AGENDA" title="Subiecte deschise" />{debates.map((debate) => <button key={debate.id} className={`debate-choice ${activeDebate?.id === debate.id ? "active" : ""}`} onClick={() => { onSelectDebate(debate.id); setSelectedArgumentId(""); }}><span>{debate.domain}</span><strong>{debate.title}</strong><small>{debate.arguments.length} argumente · {debate.closesAt}</small></button>)}</aside>
      <div className="debate-main">
        {activeDebate && <>
          <section className="os-panel debate-question"><span className="status-chip status-chip-open">DEZBATERE DEMO</span><h2>{activeDebate.question}</h2><p>{activeDebate.domain} · {activeDebate.closesAt}</p></section>
            <div className="argument-columns">
            <ArgumentColumn title="Argumente pro" side="PRO" arguments={proArguments} selectedId={selectedArgument?.id ?? ""} onSelectArgument={setSelectedArgumentId} onSupport={onSupport} canParticipate={canParticipate} />
            <ArgumentColumn title="Argumente contra" side="CON" arguments={conArguments} selectedId={selectedArgument?.id ?? ""} onSelectArgument={setSelectedArgumentId} onSupport={onSupport} canParticipate={canParticipate} />
          </div>
          <section className="os-panel ai-review-panel">
            <div className="ai-review-head"><div><span className="ai-mark">AI</span><div><small>ANALIZA ARGUMENTULUI SELECTAT</small><h3>{selectedArgument?.title ?? "Alege un argument"}</h3></div></div><span className="status-chip status-chip-warn">EXEMPLU DE RUBRICA</span></div>
            <div className="review-dimensions">
              <ReviewDimension label="Verificare factuala" value={reviewExample?.facts ?? "Neanalizat"} tone="amber" />
              <ReviewDimension label="Presupuneri" value={reviewExample?.assumptions ?? "Neanalizat"} tone="blue" />
              <ReviewDimension label="Logica" value={reviewExample?.reasoning ?? "Neanalizat"} tone="amber" />
              <ReviewDimension label="Atac personal" value={reviewExample?.conduct ?? "Neanalizat"} tone="green" />
            </div>
            <p className="ai-explanation">{reviewExample?.note ?? "Acest argument local nu a fost analizat; in prototip nu exista un model AI conectat."}</p>
            <p className="panel-footnote">Etichetele afisate pentru argumentele de mostra sunt text demonstrativ predefinit, nu output de model. Un argument nou ramane neanalizat. In produsul real, fiecare observatie trebuie legata de fragmentul analizat si poate fi corectata sau contestata.</p>
          </section>
          <section className="os-panel add-argument-panel"><div className="add-argument-heading"><div><PanelTitle label="CONTRIBUTIE" title="Adauga un argument" /><p>Foloseste o afirmatie clara, explica rationamentul si ataseaza o sursa daca ai una.</p></div><button className="button button-outline button-small" onClick={() => setShowForm((value) => !value)}>{showForm ? "Inchide" : "+ Argument"}</button></div>
            {showForm && (canParticipate ? <form className="argument-form" onSubmit={(event) => { onAddArgument(event); setShowForm(false); }}>
              <label>Directie<select name="side"><option value="PRO">Sustine propunerea</option><option value="CON">Contesta sau arata costul</option></select></label>
              <label>Afirmație scurta<input name="title" required minLength={12} maxLength={180} placeholder="O propozitie principala, fara atacuri la persoana" /></label>
              <label>Rationament<textarea name="body" required minLength={30} maxLength={1500} rows={3} placeholder="Ce dovezi sau legaturi logice sustin afirmatia? Ce ar putea sa o infirme?" /></label>
              <label>Sursa sau verificarea necesara<input name="source" maxLength={300} placeholder="URL public, set de date sau ce sursa trebuie ceruta" /></label>
              <button className="button button-primary" type="submit">Adauga in previzualizarea locala</button>
            </form> : <div className="inline-gate"><span>Contul demo este necesar pentru contributii in acest prototip.</span><button className="text-button" onClick={onEnterDemo}>Intra ca cetatean demo →</button></div>)}
          </section>
        </>}
      </div>
    </div>
  </>;
}

function ArgumentColumn({ title, side, arguments: items, selectedId, onSelectArgument, onSupport, canParticipate }: {
  title: string; side: Side; arguments: Argument[]; selectedId: string; onSelectArgument: (id: string) => void;
  onSupport: (id: string) => void; canParticipate: boolean;
}) {
  return <section className={`argument-column ${side.toLowerCase()}`}><div className="argument-column-title"><h3>{title}</h3><span>{items.length}</span></div>{items.map((argument) => <article className="argument-card" key={argument.id}>
    <button className={`argument-title-button ${selectedId === argument.id ? "selected" : ""}`} onClick={() => onSelectArgument(argument.id)}>{argument.title}</button>
    <p>{argument.body}</p><div className="argument-source"><span>↗</span>{argument.source}</div>
    <div className="argument-footer"><button className={`support-button ${argument.supportedBy.includes(localParticipant) ? "supported" : ""}`} disabled={!canParticipate} onClick={() => onSupport(argument.id)} title={!canParticipate ? "Intra ca cetatean demo pentru a sustine" : "Comuta sustinerea demonstrativa"}>{argument.supportedBy.includes(localParticipant) ? "✓ Sustii" : "↑ Sustine"} {argument.supportCount}</button><span>{argument.isLocal ? "LOCAL" : "MOSTRA"}</span></div>
  </article>)}</section>;
}

function ReviewDimension({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <div className={`review-dimension tone-${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

const specialists = [
  { group: "Sanatate", specialty: "Cardiologie", people: "2.4k", places: "42 judete", gap: "Acoperirea regionala trebuie validata" },
  { group: "Sanatate", specialty: "Neurologie", people: "0.8k", places: "31 judete", gap: "Acces mai redus in zone rurale" },
  { group: "Sanatate", specialty: "Pediatrie", people: "1.6k", places: "40 judete", gap: "Disponibilitatea pe ture lipseste" },
  { group: "Inginerie", specialty: "Inginerie civila", people: "18k", places: "42 judete", gap: "Proiectele locale nu sunt aliniate" },
  { group: "Inginerie", specialty: "Software si date", people: "12k", places: "42 judete", gap: "Competențe eterogene" },
  { group: "Inginerie", specialty: "Energie si industrial", people: "7k", places: "38 judete", gap: "Cerere viitoare necartografiata" }
];

function SpecialistCapacity() {
  const [filter, setFilter] = useState("Toate");
  const rows = specialists.filter((item) => filter === "Toate" || item.group === filter);
  return <>
    <ModuleHeading eyebrow="D09 DEZVOLTARE UMANA · D04 ECONOMIE" title="Capacitatea de specialitate" copy="O vedere agregata a competentelor si serviciilor profesionale necesare pentru planificare, formare si continuitate. Nu este un registru de persoane si nu estimeaza calitatea unui individ." />
    <div className="privacy-strip"><strong>Model de date recomandat:</strong> numaratori agregate dupa specialitate, regiune si interval; sursa si definitie vizibile. Datele individuale raman la organismele care le detin legal.</div>
    <div className="module-toolbar"><div className="segmented-filter">{["Toate", "Sanatate", "Inginerie"].map((group) => <button key={group} className={filter === group ? "active" : ""} onClick={() => setFilter(group)}>{group}</button>)}</div><span className="status-chip status-chip-warn">NUMERE FICTIVE · FARA SURSA</span></div>
    <div className="capacity-table-wrap"><table className="data-table"><thead><tr><th>Grup</th><th>Specialitate</th><th>Stoc demo</th><th>Acoperire</th><th>Necunoscuta operationala</th></tr></thead><tbody>{rows.map((item) => <tr key={item.specialty}><td>{item.group}</td><td><strong>{item.specialty}</strong></td><td className="demo-number">{item.people}</td><td>{item.places}</td><td>{item.gap}</td></tr>)}</tbody></table></div>
    <div className="three-note-grid"><InfoCard title="Definitie" copy="Clarifica daca masori persoane autorizate, echivalent norma intreaga, locuri de munca sau ore disponibile. Nu le amesteca." /><InfoCard title="Pipelines" copy="Leaga absolvirea, recunoasterea calificarii si posturile deschise prin statistici agregate si date cu actualizare indicata." /><InfoCard title="Limita" copy="Un deficit estimat poate cere analiza si formare; nu poate asigna automat o persoana, scoala sau unitate." /></div>
  </>;
}

const prices = [
  ["Combustibil", "Benzina", "RON / litru", "7,42", "Exemplu: sondaj de preturi"],
  ["Energie", "Electricitate", "RON / kWh", "1,18", "Exemplu: factura tip"],
  ["Utilitati", "Apa si canal", "RON / m³", "9,60", "Exemplu: tarif local"],
  ["Alimente", "Paine", "RON / 500 g", "4,20", "Exemplu: cos voluntar"],
  ["Alimente", "Carne de porc", "RON / kg", "26,50", "Exemplu: cos voluntar"],
  ["Alimente", "Carne de vita", "RON / kg", "42,00", "Exemplu: cos voluntar"],
  ["Alimente", "Rosii", "RON / kg", "11,80", "Exemplu: cos voluntar"],
  ["Alimente", "Cartofi", "RON / kg", "4,10", "Exemplu: cos voluntar"],
  ["Alimente", "Varza", "RON / kg", "3,60", "Exemplu: cos voluntar"],
  ["Alimente", "Morcovi", "RON / kg", "4,80", "Exemplu: cos voluntar"],
  ["Locuire", "Chirie apartament", "RON / luna", "2.450", "Exemplu: anunturi publice"],
  ["Mobilitate", "Transport public", "RON / calatorie", "3,00", "Exemplu: tarif public"],
  ["Mobilitate", "Ride sharing", "RON / cursa 5 km", "22,00", "Exemplu: cos voluntar"],
  ["Servicii", "Colectare deseuri", "RON / gospodarie / luna", "24,00", "Exemplu: tarif local"]
];

function PriceObservatory() {
  const [group, setGroup] = useState("Toate");
  const groups = ["Toate", ...Array.from(new Set(prices.map((row) => row[0])))];
  const rows = prices.filter((row) => group === "Toate" || row[0] === group);
  return <>
    <ModuleHeading eyebrow="D04 ECONOMIE · D12 MASURARE" title="Observator de preturi si accesibilitate" copy="Urmareste bunuri si servicii de baza pe unitate comparabila, regiune, perioada, sursa si calitate. Un pret mediu nu arata singur daca oamenii isi permit acel bun." />
    <div className="price-summary-grid"><Kpi label="Categorii in cosul demo" value="6" detail="Alimente, energie, locuire, transport" /><Kpi label="Produse si servicii" value={String(prices.length)} detail="Set fictiv pentru prototip" /><Kpi label="Actualizat" value="—" detail="Nicio observatie live conectata" /></div>
    <div className="module-toolbar"><div className="segmented-filter scroll-filter">{groups.map((item) => <button key={item} className={group === item ? "active" : ""} onClick={() => setGroup(item)}>{item}</button>)}</div><span className="status-chip status-chip-warn">VALORI DEMONSTRATIVE</span></div>
    <div className="capacity-table-wrap"><table className="data-table price-table"><thead><tr><th>Categorie</th><th>Produs / serviciu</th><th>Unitate</th><th>RON demo</th><th>Tip de sursa necesar</th><th>Vechime</th></tr></thead><tbody>{rows.map(([category, item, unit, amount, source]) => <tr key={item}><td><span className="category-tag">{category}</span></td><td><strong>{item}</strong></td><td>{unit}</td><td className="demo-number">{amount}</td><td>{source}</td><td><span className="status-dot gray" /> Nu e live</td></tr>)}</tbody></table></div>
    <div className="price-method"><strong>Comparabilitatea conteaza.</strong><span>Separati pretul de promotii, gramaj, calitate, taxe, regiune si canal; publicati mediane si distributii, nu pretul unui singur magazin.</span></div>
  </>;
}

function JobsAndSkills() {
  const [regionFilter, setRegionFilter] = useState("Toate regiunile");
  const jobs = [
    { role: "Inginer instalatii electrice", area: "Cluj · Zona demo", skills: "retele, autorizare, proiectare", employer: "Operator infrastructura (exemplu)", type: "Angajare" },
    { role: "Asistent medical pediatrie", area: "Iasi · Zona demo", skills: "pediatrie, triaj, comunicare", employer: "Unitate medicala (exemplu)", type: "Angajare" },
    { role: "Tehnician agricultura de precizie", area: "Buzau · Zona demo", skills: "senzori, irigare, GIS", employer: "Cooperativa agricola (exemplu)", type: "Ucenicie" },
    { role: "Specialist date transport", area: "Bucuresti · Zona demo", skills: "analiza, accesibilitate, GTFS", employer: "Autoritate de mobilitate (exemplu)", type: "Proiect" }
  ];
  const visibleJobs = jobs.filter((job) => regionFilter === "Toate regiunile" || job.area.startsWith(regionFilter));
  const regions = ["Toate regiunile", ...jobs.map((job) => job.area.split(" ·")[0])];
  return <>
    <ModuleHeading eyebrow="D04 ECONOMIE · D09 DEZVOLTARE UMANA" title="Munca, formare si oportunitati" copy="Leaga competentele cerute de posturi, formare si angajatori, ca absolventii sa poata vedea trasee plauzibile. Anunturile trebuie sa expire sau sa fie reconfirmate, nu sa devina un scor asupra candidatilor." />
    <div className="jobs-top-grid"><div className="os-panel pathway-panel"><PanelTitle label="TRANZITIE" title="De la invatare la munca" /><div className="pathway"><span>Competenta</span><b>→</b><span>Formare</span><b>→</b><span>Post verificat</span><b>→</b><span>Feedback</span></div><p>Maparea arata cererea agregata si caile de acces. Profilul curricular si datele de recrutare raman controlate de persoane si angajatori.</p></div><div className="os-panel"><PanelTitle label="OPORTUNITATI" title="In acest demo" /><div className="opportunity-count"><strong>{jobs.length}</strong><span>posturi fictive</span></div><small>Din care 1 ucenicie si 1 proiect demonstrativ</small></div></div>
    <div className="module-toolbar"><label className="service-select">Zona<select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>{regions.map((region) => <option key={region}>{region}</option>)}</select></label><span className="status-chip status-chip-warn">ANUNTURI FICTIVE · FARA FEED DE POSTURI</span></div>
    <div className="jobs-list">{visibleJobs.map((job) => <article className="job-card" key={job.role}><div className="job-type">{job.type}</div><div><h3>{job.role}</h3><p>{job.employer} · {job.area}</p><small>Competente cerute: {job.skills}</small></div><button className="text-button" title="Linkurile de aplicare vor veni din surse verificate">Detalii sursa <span>↗</span></button></article>)}</div>
    <div className="privacy-strip"><strong>Surse candidate:</strong> anunturi publice cu permisiuni de reutilizare, servicii publice de ocupare, angajatori verificati si programe de formare. Afisarea unui post nu este recomandare de cariera si nu promite angajare.</div>
  </>;
}

function AgricultureAndFood() {
  const stages = [
    ["01", "Seminte, fertilizanti si energie", "Importuri, pret, disponibilitate si dependente"],
    ["02", "Fermieri si productie", "Suprafata/volum agregat, sezon, metoda si variatie"],
    ["03", "Apa, sol si vreme", "Resurse, seceta, presiuni si efecte ecologice"],
    ["04", "Depozitare si procesare", "Capacitate, pierderi, transformare si locuri de munca"],
    ["05", "Distributie si acces", "Preturi, transport, stocuri si disponibilitate sezoniera"]
  ];
  const crops = [
    ["Cereale si panificatie", "Seminte → recolta → siloz → moara → paine"],
    ["Cartofi si legume", "Ferma → sortare/depozitare → procesare → piata"],
    ["Carne si lactate", "Ferma → procesare → lant frigorific → distributie"]
  ];
  return <>
    <ModuleHeading eyebrow="D04 ECONOMIE · D07 LANTURI · D08 MEDIU" title="Agricultura si rezilienta alimentara" copy="Urmarirea productiei inseamna sa intelegi intrarile, apa si solul, recolta, depozitarea, procesarea, transportul, pierderile si accesul oamenilor la hrana." />
    <div className="os-data-warning"><strong>Nicio statistica agricola live conectata.</strong> Graficul de sistem de mai jos este o schema de masurare, nu o estimare a recoltei sau stocurilor curente.</div>
    <section className="os-panel food-flow-panel"><PanelTitle label="FOOD SYSTEM LOOP" title="De la resursa la masa si inapoi la sol" /><div className="food-stages">{stages.map(([number, title, detail], index) => <article className="food-stage" key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p>{index < stages.length - 1 && <b>→</b>}</article>)}</div></section>
    <div className="capacity-table-wrap"><table className="data-table"><thead><tr><th>Grupa lant</th><th>Etape ce pot fi urmarite</th><th>Productie</th><th>Stocuri / pierderi</th><th>Surse</th></tr></thead><tbody>{crops.map(([name, chain]) => <tr key={name}><td><strong>{name}</strong></td><td>{chain}</td><td><span className="status-dot gray" /> Nedisponibil</td><td><span className="status-dot gray" /> Nedisponibil</td><td>Proprietar de date necesar</td></tr>)}</tbody></table></div>
    <div className="three-note-grid"><InfoCard title="Productivitate si venit" copy="Masurati randamentul pe unitate de teren si input, dar publicati si distributia veniturilor si costurilor pentru ferme de dimensiuni diferite." /><InfoCard title="Apa, sol si clima" copy="Corelati productia cu resursele si limitele ecologice. Un rezultat agricol nu justifica extragerea nelimitata de apa sau degradarea solului." /><InfoCard title="Acces la hrana" copy="Compara preturile, pierderile, stocarea si disponibilitatea cu nevoile comunitatii fara a expune mici producatori sau cumparatori." /></div>
  </>;
}

function TradeAndSupply() {
  const steps = [
    { stage: "01 · ORIGINE", title: "Resursa importata", detail: "Cupru rafinat · origine si lot declarate", owner: "Furnizor extern", state: "Import" },
    { stage: "02 · TRANSFORMARE", title: "Cablare si testare", detail: "Intrari, energie, pierderi si certificat", owner: "Producator local", state: "Productie" },
    { stage: "03 · LIVRARE", title: "Retea electrica", detail: "Contract, cantitate si destinatie agregata", owner: "Operator de retea", state: "Utilizare interna" },
    { stage: "04 · EXPORT", title: "Produs finit", detail: "Componenta testata pentru piata externa", owner: "Exportator local", state: "Export" }
  ];
  return <>
    <ModuleHeading eyebrow="D07 LANTURI DE APROVIZIONARE · D04 ECONOMIE" title="Import, productie si valoare adaugata" copy="Urmareste drumul unui lot de la resursa la produs si destinatie. Vizualizeaza dependentele si valoarea transformarii fara a expune secrete comerciale sau locatia exacta a infrastructurii critice." />
    <div className="trade-controls"><span className="status-chip status-chip-warn">LANTURI FICTIVE · FARA DATE VAMALE</span><span>Vedere demonstrativa: materiale → productie → livrare</span></div>
    <section className="supply-chain-flow">{steps.map((step, index) => <article className="chain-step" key={step.stage}><span className="chain-stage">{step.stage}</span><div className="chain-node">{index === 0 ? "↓" : index === 3 ? "↗" : "◇"}</div><h3>{step.title}</h3><p>{step.detail}</p><small>{step.owner}</small><span className="chain-state">{step.state}</span>{index < steps.length - 1 && <span className="chain-connector">→</span>}</article>)}</section>
    <div className="trade-metrics">{[["Dependenta de import", "date lipsa"], ["Valoare transformata local", "date lipsa"], ["Timp de la resursa la produs", "date lipsa"], ["Pierderi / deseuri", "date lipsa"]].map(([title, value]) => <div className="trade-metric" key={title}><span>{title}</span><strong>{value}</strong></div>)}</div>
    <div className="three-note-grid"><InfoCard title="Importuri" copy="Origine, volum, concentrare, termen si material critic; publicati agregat unde contractele sau siguranta cer protectie." /><InfoCard title="Exporturi" copy="Produs finit, servicii, piete, continut local si dependente de inputuri importate." /><InfoCard title="Economie circulara" copy="Reparare, reutilizare, reciclare, randament material si efecte de mediu urmarite pe lot, nu pe angajat." /></div>
  </>;
}

function Tourism() {
  const attractions = [
    { name: "Delta Dunarii", type: "Natura", season: "Primavara–toamna", access: "Acces pe apa; mobilitate redusa de verificat", signal: "Sursa turistica neconectata" },
    { name: "Cetatea Alba Carolina", type: "Patrimoniu", season: "Tot anul", access: "Trasee si evenimente locale", signal: "Calendar demonstrativ" },
    { name: "Transfagarasan", type: "Peisaj si mobilitate", season: "Sezonier; accesul depinde de conditiile drumului", access: "Status rutier trebuie preluat oficial", signal: "Fara status live" },
    { name: "Centrul istoric Oradea", type: "Cultura urbana", season: "Tot anul", access: "Transport local si accesibilitate", signal: "Sursa turistica neconectata" }
  ];
  return <>
    <ModuleHeading eyebrow="D04 ECONOMIE · D06 INFRASTRUCTURA" title="Turism, patrimoniu si capacitate locala" copy="Ajuta vizitatorii sa planifice si comunitatile sa inteleaga sezonalitatea, accesibilitatea si efectul economic. Nu transforma un semnal de aglomerare in restrictii automate de acces." />
    <div className="tourism-grid">{attractions.map((place, index) => <article className="tourism-card" key={place.name}><div className={`tourism-art tourism-art-${index + 1}`}><span>{place.type}</span><b>{String(index + 1).padStart(2, "0")}</b></div><div className="tourism-copy"><h3>{place.name}</h3><p>{place.season}</p><div className="tourism-access"><strong>Acces</strong><span>{place.access}</span></div><small><span className="status-dot gray" />{place.signal}</small></div></article>)}</div>
    <section className="os-panel tourism-measure-panel"><PanelTitle label="MASURATORI CAND EXISTA SURSE" title="Turism bun pentru vizitatori si locuitori" /><div className="tourism-measures"><span>Vizite pe sezon si ora, cu metoda</span><span>Capacitate de transport si parcare</span><span>Accesibilitate si servicii locale</span><span>Venit local, munca si costuri comunitare</span></div></section>
  </>;
}

function TimeUse() {
  const [service, setService] = useState("Transport public");
  const patterns = service === "Transport public"
    ? [["06–08", 48], ["08–10", 91], ["10–12", 54], ["12–14", 46], ["14–16", 62], ["16–18", 96], ["18–20", 57]] as [string, number][]
    : [["06–08", 19], ["08–10", 44], ["10–12", 80], ["12–14", 74], ["14–16", 68], ["16–18", 53], ["18–20", 28]] as [string, number][];
  return <>
    <ModuleHeading eyebrow="D05 SERVICII · D12 MASURARE" title="Cerere in timp si programul serviciilor" copy="Planifica orele de transport, ghisee, clinici si activitati publice pe baza cererii agregate. Scopul este ca serviciile sa se potriveasca vietii oamenilor, nu sa supravegheze cand lucreaza fiecare." />
    <div className="privacy-strip"><strong>Regula de proiectare:</strong> nu colectam orarul individual al angajatilor sau cetatenilor. Se pot folosi statistici de utilizare institutionale si contributii voluntare agregate, numai peste un prag de grup sigur.</div>
    <div className="module-toolbar"><label className="service-select">Serviciu<select value={service} onChange={(event) => setService(event.target.value)}><option>Transport public</option><option>Ghisee publice</option></select></label><span className="status-chip status-chip-warn">GRAFIC FICTIV · EXEMPLU DE CERERE</span></div>
    <section className="os-panel demand-chart-panel"><PanelTitle label="VOLUM RELATIV PE FEREASTRA ORARA" title={`Cand este nevoie de ${service.toLowerCase()}?`} /><div className="demand-bars">{patterns.map(([time, value]) => <div className="demand-bar" key={time}><div className="bar-track"><span style={{ height: `${value}%` }} /></div><strong>{value}</strong><small>{time}</small></div>)}</div><div className="chart-legend"><span><i /> Cerere relativa demonstrativa</span><small>Nu reprezinta numar de persoane sau utilizari reale.</small></div></section>
    <div className="three-note-grid"><InfoCard title="Compara" copy="Cererea dupa ora, zi, sezon, regiune si sarbatori; separa utilizatorii de tranzactii repetate." /><InfoCard title="Propune" copy="Testeaza ore extinse, ture suprapuse sau schimbari de frecventa si include costul pentru personal." /><InfoCard title="Evalueaza" copy="Urmareste timpii de asteptare, accesul si impactul asupra lucratorilor inainte de a schimba programul permanent." /></div>
  </>;
}

function InfoCard({ title, copy }: { title: string; copy: string }) {
  return <article className="os-panel info-card"><span>OPERATING RULE</span><h3>{title}</h3><p>{copy}</p></article>;
}
