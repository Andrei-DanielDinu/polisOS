import { useEffect, useMemo, useState } from "react";

type Need = {
  id: string;
  field: string;
  place: string;
  title: string;
  outcome: string;
  skills: string[];
};

type LocalProfile = {
  skills: string[];
  region: string;
  hoursPerWeek: number;
  interested: string[];
};

const profileKey = "polisos.capacity-opt-in.v1";

const capabilities = [
  { id: "food", title: "Produce hrană și bunuri esențiale", output: "Hrană, apă, energie, materiale și aprovizionare sigură", teams: "Agricultură · utilități · producție" },
  { id: "maintain", title: "Întreține și repară", output: "Drumuri, căi ferate, clădiri, energie, apă și echipamente", teams: "Ingineri · meseriași · tehnicieni · operatori" },
  { id: "care", title: "Îngrijește și educă", output: "Acces la sănătate, educație, formare și incluziune", teams: "Personal medical · profesori · îngrijitori · specialiști" },
  { id: "respond", title: "Răspunde la urgențe", output: "Poliție, pompieri, dispecerat și paramedici pregătiți", teams: "Servicii de intervenție · medicină · logistică" },
  { id: "admin", title: "Administrează și finanțează", output: "Servicii legale, bugete publice, achiziții și evidențe", teams: "Administrație · juridic · finanțe · audit" },
  { id: "protect", title: "Protejează și apără", output: "Reziliență civilă, apărare cibernetică și securitate națională", teams: "Instituții autorizate · personal verificat" },
  { id: "trade", title: "Comercializează și dezvoltă", output: "Afaceri sustenabile, turism și venituri din export", teams: "Producători · antreprenori · logistică · vânzări" }
];

const staffingMeasures = [
  { field: "Sănătate", specialty: "Cardiologi", measure: "Medici autorizați · activi · FTE · programări", source: "Registru profesional / furnizori medicali" },
  { field: "Sănătate", specialty: "Neurologi", measure: "Medici autorizați · activi · FTE · acces regional", source: "Registru profesional / furnizori medicali" },
  { field: "Sănătate", specialty: "Pediatri și asistenți", measure: "Personal activ · posturi · FTE · capacitate clinică", source: "Furnizori medicali / autorități de sănătate" },
  { field: "Urgențe", specialty: "Paramedici și pompieri", measure: "Personal în serviciu · ture · acoperire de intervenție", source: "Instituții de intervenție; agregat autorizat" },
  { field: "Infrastructură", specialty: "Ingineri civili și electricieni", measure: "Calificați · posturi ocupate · mentenanță planificată", source: "Angajatori / autorități tehnice" },
  { field: "Energie și utilități", specialty: "Ingineri și tehnicieni de instalații", measure: "Personal activ · competențe · capacitate de intervenție", source: "Operatori de rețea și autorități de reglementare" },
  { field: "Agricultură", specialty: "Agronomi și operatori de utilaje", measure: "Fermieri / personal sezonier / suprafață deservită", source: "Instituții agricole / cooperative participante" },
  { field: "Industrie", specialty: "Croitori industriali și tehnicieni de producție", measure: "Posturi, schimburi, capacitate productivă, competențe", source: "Angajatori / formare profesională" },
  { field: "Educație", specialty: "Profesori și formatori tehnici", measure: "Posturi ocupate · ore de predare · locuri de formare", source: "Unități de învățământ / autorități educaționale" },
  { field: "Administrație și finanțe", specialty: "Contabili, achiziții și funcționari", measure: "Posturi, timp de procesare, competențe și volum de serviciu", source: "Instituții publice · date agregate" }
];

const skillOptions = [
  "Agronomie", "Irigare", "Utilaje agricole", "Procesarea alimentelor", "Tratarea apei", "Mentenanță electrică", "Energie regenerabilă",
  "Inginerie civilă", "Mentenanță rutieră și feroviară", "Încălzire și instalații", "Reparații mecanice", "Croitorie industrială", "Tipare vestimentare",
  "Planificarea producției", "Controlul calității", "Sănătate", "Pediatrie", "Asistență medicală", "Intervenție paramedicală", "Securitate la incendiu",
  "Predare și formare", "Logistică", "Contabilitate", "Achiziții publice", "Software și date", "Securitate cibernetică"
];

const needs: Need[] = [
  { id: "irrigation", field: "Agricultură și apă", place: "Buzău · exemplu", title: "Repară pompele de irigare înaintea sezonului agricol", outcome: "Mai puține întreruperi evitabile pentru producătorii locali", skills: ["Irigare", "Reparații mecanice", "Mentenanță electrică"] },
  { id: "grid", field: "Energie și mentenanță", place: "Brașov · exemplu", title: "Pregătește alimentarea de rezervă a unui centru medical", outcome: "Plan testat pentru continuitatea echipamentelor esențiale", skills: ["Mentenanță electrică", "Energie regenerabilă", "Reparații mecanice"] },
  { id: "school", field: "Educație și clădiri", place: "Iași · exemplu", title: "Repară automatizarea încălzirii dintr-o școală", outcome: "Săli funcționale în sezonul rece", skills: ["Încălzire și instalații", "Mentenanță electrică", "Inginerie civilă"] },
  { id: "response", field: "Pregătire pentru urgențe", place: "Cluj · exemplu", title: "Organizează un exercițiu de prim ajutor și intervenție", outcome: "Predare exersată între dispecerat, intervenție și echipe medicale", skills: ["Intervenție paramedicală", "Sănătate", "Logistică"] },
  { id: "uniforms", field: "Industrie și export", place: "Timiș · exemplu", title: "Testează un atelier local de uniforme și îmbrăcăminte de lucru", outcome: "Lot de producție calculat, cumpărători și condiții de livrare", skills: ["Croitorie industrială", "Tipare vestimentare", "Planificarea producției", "Controlul calității"] },
  { id: "bridge", field: "Transport și infrastructură", place: "Sibiu · exemplu", title: "Evaluează lucrările restante la întreținerea unui pod", outcome: "Plan de inspecție trasabil pentru administratorul drumului", skills: ["Inginerie civilă", "Mentenanță rutieră și feroviară", "Contabilitate"] },
  { id: "care", field: "Sănătate și educație", place: "Constanța · exemplu", title: "Proiectează un traseu de formare pentru îngrijirea pediatrică", outcome: "Locuri de formare și lacune de servicii revizuite de instituții", skills: ["Pediatrie", "Asistență medicală", "Predare și formare", "Software și date"] },
  { id: "export", field: "Afaceri și comerț", place: "Național · exemplu", title: "Conectează producători mici cu o oportunitate de export verificată", outcome: "Cumpărător identificat, specificație și plan de livrare documentate", skills: ["Procesarea alimentelor", "Controlul calității", "Logistică", "Contabilitate"] }
];

function readProfile(): LocalProfile {
  const empty: LocalProfile = { skills: [], region: "Fără preferință", hoursPerWeek: 4, interested: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(profileKey) ?? "null") as Partial<LocalProfile> | null;
    if (!saved) return empty;
    return {
      skills: Array.isArray(saved.skills) ? saved.skills.filter((skill) => skillOptions.includes(skill)) : [],
      region: saved.region ?? empty.region,
      hoursPerWeek: Math.max(0, Math.min(40, Number(saved.hoursPerWeek) || 0)),
      interested: Array.isArray(saved.interested) ? saved.interested : []
    };
  } catch {
    return empty;
  }
}

export function CapacityPlanner() {
  const [profile, setProfile] = useState<LocalProfile>(readProfile);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try { localStorage.setItem(profileKey, JSON.stringify(profile)); } catch { /* local matching remains available for this page load */ }
  }, [profile]);

  const matchedNeeds = useMemo(() => needs.map((need) => ({
    ...need,
    sharedSkills: need.skills.filter((skill) => profile.skills.includes(skill)),
    regionMatches: profile.region === "Fără preferință" || need.place.startsWith(profile.region)
  })).sort((first, second) => second.sharedSkills.length - first.sharedSkills.length || Number(second.regionMatches) - Number(first.regionMatches)), [profile.skills, profile.region]);
  const interestedCount = profile.interested.length;

  const toggleSkill = (skill: string) => setProfile((current) => ({
    ...current,
    skills: current.skills.includes(skill) ? current.skills.filter((item) => item !== skill) : [...current.skills, skill]
  }));

  const toggleInterest = (needId: string) => {
    const selected = profile.interested.includes(needId);
    setProfile((current) => ({
      ...current,
      interested: selected ? current.interested.filter((id) => id !== needId) : [...current.interested, needId]
    }));
    setNotice(selected ? "Interesul a fost retras din lista locală." : "Interesul a fost salvat doar în acest browser.");
  };

  const reset = () => {
    try { localStorage.removeItem(profileKey); } catch { /* reset remains available for this page load */ }
    setProfile({ skills: [], region: "Fără preferință", hoursPerWeek: 4, interested: [] });
    setNotice("Profilul local a fost șters.");
  };

  return <>
    <ModuleHeading eyebrow="NEVOI NAȚIONALE · COMPETENȚE · PROIECTE" title="De la ce are nevoie țara la echipe capabile să livreze" copy="Leagă misiunile esențiale de competențe, capacități și proiecte verificabile. O potrivire sugerează o posibilă contribuție; persoana decide dacă participă, iar autoritatea rămâne la instituțiile competente." />
        <div className="capacity-explainer"><strong>Modelul de organizare</strong><span>Nevoie publică → rezultat de serviciu → competențe și active → echipă voluntară sau furnizor → autorizare, buget și răspundere → rezultat măsurat.</span></div>

    <section className="national-capability-grid" aria-label="Funcții necesare unei țări">
      {capabilities.map((item, index) => <article className="national-capability-card" key={item.id}>
        <span className="capability-index">{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.output}</p><small>{item.teams}</small>
      </article>)}
    </section>

    <section className="os-panel capacity-measures-panel">
      <div className="panel-title"><span>INDICATORI DE CAPACITATE · SURSĂ NECONECTATĂ</span><h3>Numerele care trebuie urmărite pe specialitate</h3></div>
      <p>Nu am completat valori naționale inventate. Pentru fiecare rând trebuie stabilite unitatea corectă, perioada, localizarea, sursa și limitele de acoperire înainte de publicare.</p>
      <div className="capacity-table-wrap"><table className="data-table"><thead><tr><th>Domeniu</th><th>Specialitate</th><th>Măsură utilă</th><th>Proprietar de date candidat</th><th>Valoare</th></tr></thead><tbody>{staffingMeasures.map((item) => <tr key={item.specialty}><td>{item.field}</td><td><strong>{item.specialty}</strong></td><td>{item.measure}</td><td>{item.source}</td><td><span className="status-dot gray" /> Neconectat</td></tr>)}</tbody></table></div>
      <small className="capacity-measures-footnote">Nu amesteca persoane autorizate, profesioniști activi, posturi finanțate, echivalente normă întreagă, ore lucrate, disponibilitate voluntară și capacitate efectivă de serviciu.</small>
    </section>

    <div className="os-data-warning"><strong>Exemple de nevoi, nu ordine de lucru.</strong> Niciun stat, serviciu public, post sau proiect real nu este conectat. Personalul instituțiilor, capacitatea operațională și disponibilitatea cetățenilor nu sunt inventate pentru acest ecran.</div>

    <div className="capacity-planner-grid">
      <section className="os-panel volunteer-skill-panel">
        <div className="panel-title"><span>PARTICIPARE OPȚIONALĂ</span><h3>Ce competențe vrei să oferi?</h3></div>
        <p>Alege doar competențele pe care vrei să le folosești pentru a explora potriviri. Etichetele sunt auto-declarate; calificările profesionale trebuie verificate de emitent sau de angajator înaintea unei activități reglementate.</p>
        <div className="skill-chip-grid">{skillOptions.map((skill) => <label className={profile.skills.includes(skill) ? "skill-chip chosen" : "skill-chip"} key={skill}>
          <input type="checkbox" checked={profile.skills.includes(skill)} onChange={() => toggleSkill(skill)} /><span>{skill}</span>
        </label>)}</div>
        <div className="capacity-profile-controls">
          <label>Arie geografică<select value={profile.region} onChange={(event) => setProfile((current) => ({ ...current, region: event.target.value }))}>
            {["Fără preferință", "Brașov", "Buzău", "Cluj", "Constanța", "Iași", "Sibiu", "Timiș"].map((region) => <option key={region}>{region}</option>)}
          </select></label>
          <label>Timp pe care îl poți aloca<input type="number" min="0" max="40" value={profile.hoursPerWeek} onChange={(event) => setProfile((current) => ({ ...current, hoursPerWeek: Math.max(0, Math.min(40, Number(event.target.value) || 0)) }))} /><small>ore / săptămână · opțional</small></label>
        </div>
        <div className="capacity-local-note"><span>LOCAL</span><p>Competențele, zona și interesul tău se păstrează doar în browser. Nu sunt publicate, trimise unui angajator sau folosite pentru a te repartiza.</p></div>
        <button className="text-button" onClick={reset}>Șterge datele locale <span>↺</span></button>
      </section>

      <section className="os-panel needs-board-panel">
        <div className="panel-title"><span>NEVOI → POSIBILE CONTRIBUȚII</span><h3>Exemple de lucrări care pot fi organizate</h3></div>
        <div className="needs-board-intro"><span className="needs-count">{needs.length}</span><p>scenarii demonstrative · {profile.skills.length} competențe selectate · {interestedCount} marcate ca interes</p></div>
        {notice && <div className="os-local-notice" role="status">{notice}</div>}
        <div className="needs-card-list">{matchedNeeds.map((need) => <article className="national-need-card" key={need.id}>
          <div className="need-card-top"><span>{need.field}</span><small>{need.place}</small></div>
          <h4>{need.title}</h4><p>{need.outcome}</p>
          <div className="need-skill-tags">{need.skills.map((skill) => <span className={need.sharedSkills.includes(skill) ? "shared" : ""} key={skill}>{skill}</span>)}</div>
          <div className="need-card-bottom"><small>{need.sharedSkills.length ? `Potrivire după competențe: ${need.sharedSkills.join(", ")}` : "Selectează o competență relevantă pentru a vedea motivul potrivirii."}{!need.regionMatches ? ` · Zona ta (${profile.region}) diferă de scenariul local.` : ""} · Disponibilitate introdusă: {profile.hoursPerWeek} h/săptămână.</small>
            <button className={profile.interested.includes(need.id) ? "button button-primary button-small" : "button button-outline button-small"} onClick={() => toggleInterest(need.id)}>{profile.interested.includes(need.id) ? "Interes exprimat ✓" : "Mă interesează"}</button>
          </div>
        </article>)}</div>
      </section>
    </div>
    <div className="capacity-safeguard"><strong>Potrivirea nu este clasament, angajare sau mobilizare.</strong> Nu există scor global, presupunere despre disponibilitate sau asignare automată. Pentru lucrări reale trebuie identificați proprietarul instituțional, mandatul, calificările cerute, bugetul, condițiile de muncă, procedura de selecție și calea de contestare.</div>
  </>;
}

function ModuleHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div className="module-heading"><p className="os-eyebrow">{eyebrow}</p><h2>{title}</h2><p>{copy}</p></div>;
}
