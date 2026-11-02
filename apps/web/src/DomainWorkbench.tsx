import { FormEvent, useMemo, useState } from "react";

type ModuleLinkId = "debates" | "people" | "prices" | "jobs" | "food" | "supply" | "tourism" | "time" | "overview";
type FieldType = "text" | "number" | "url" | "date" | "select" | "textarea";
type EntryStatus = "NEW" | "IN_REVIEW" | "RECORDED";

interface FieldSpec {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  min?: string;
  max?: string;
}

interface LinkSpec { label: string; id?: ModuleLinkId; workflow?: boolean }
interface DomainSpec {
  code: string;
  name: string;
  remit: string;
  state: string;
  toolTitle: string;
  toolDescription: string;
  actionLabel: string;
  observation: string;
  boundary: string;
  fields: FieldSpec[];
  links?: LinkSpec[];
  calculation?: "delta" | "budget-balance";
}

interface LocalEntry {
  id: string;
  domain: string;
  values: Record<string, string>;
  status: EntryStatus;
  createdAt: string;
}

const storageKey = "polisos.domain-workbench.v1";

const domains: DomainSpec[] = [
  {
    code: "D01", name: "Identitate si acces", remit: "Conturi, permisiuni si preferinte voluntare.", state: "Control local de preferinte",
    toolTitle: "Preferinte si scopuri de date", toolDescription: "Inregistreaza o preferinta demo pentru un scop de utilizare. Nu este consimtamant juridic si nu schimba setarile unui serviciu real.", actionLabel: "Salveaza preferinta demo",
    observation: "Ce scop a ales utilizatorul si ce stare are preferinta?", boundary: "Nu colecta parola, CNP, biometrie sau date despre alta persoana. Preferintele demo nu sunt legate de autentificare.",
    fields: [
      { key: "purpose", label: "Scop", type: "select", options: ["Buletin informativ", "Contributii civice", "Portofoliu voluntar", "Cercetare participativa"], required: true },
      { key: "choice", label: "Preferinta", type: "select", options: ["Activat in demo", "Retras in demo", "Nu particip"], required: true },
      { key: "scope", label: "Nota optionala", type: "text", placeholder: "Ce acopera aceasta preferinta?" }
    ]
  },
  {
    code: "D02", name: "Institutii", remit: "Mandate, servicii si responsabili publici.", state: "Registru demo neconfirmat",
    toolTitle: "Fisa de institutie", toolDescription: "Creeaza o inregistrare locala pentru o institutie si mandatul pe care pretinde ca il exercita; sursa mandatului trebuie verificata de un operator.", actionLabel: "Adauga fisa locala",
    observation: "Ce serviciu este oferit, de cine si in baza carui mandat public?", boundary: "O fisa nu dovedeste existenta sau competenta legala a unei institutii.",
    fields: [
      { key: "name", label: "Numele organizatiei", type: "text", required: true, placeholder: "Nume publicat" },
      { key: "service", label: "Serviciu sau responsabilitate", type: "text", required: true, placeholder: "Responsabilitate declarata" },
      { key: "mandate", label: "Sursa mandatului", type: "url", placeholder: "https://..." },
      { key: "region", label: "Zona", type: "text", placeholder: "National / judet / localitate" }
    ]
  },
  {
    code: "D03", name: "Guvernare si deliberare", remit: "Subiecte, argumente si decizii explicate.", state: "Dezbateri demo disponibile",
    toolTitle: "Subiecte publice si argumente", toolDescription: "Deschide agenda de dezbateri, adauga argumente pro/contra si sustine o pozitie. Actiunile de dezbatere sunt locale in prototip.", actionLabel: "Deschide dezbateri",
    observation: "Ce optiuni si consecinte sustin argumentele?", boundary: "Sustinerea nu este vot oficial, adevar sau autoritate; un model nu decide politica.",
    fields: [], links: [{ label: "Agenda de dezbateri", id: "debates" }]
  },
  {
    code: "D04", name: "Economie", remit: "Preturi, munca, afaceri, productie si oportunitati.", state: "Instrumente demo disponibile",
    toolTitle: "Observatie locala de pret", toolDescription: "Adauga o observatie cu produs, unitate, zona si sursa. Valorile sunt demo si nu se publica in retea.", actionLabel: "Salveaza observatia demo",
    observation: "Cum se schimba costurile, oportunitatile si valoarea adaugata pe regiune?", boundary: "Nu folosi profilul civic pentru recrutare, credit sau eligibilitate.",
    fields: [
      { key: "item", label: "Produs sau serviciu", type: "text", required: true, placeholder: "Ex. paine / 500 g" },
      { key: "price", label: "Pret demo", type: "number", required: true, min: "0" },
      { key: "unit", label: "Unitate", type: "text", required: true, placeholder: "RON / kg, luna, calatorie..." },
      { key: "region", label: "Zona generala", type: "text", required: true, placeholder: "Judet / localitate" },
      { key: "source", label: "Sursa (cand exista)", type: "url", placeholder: "https://..." }
    ], links: [{ label: "Cos demonstrativ", id: "prices" }, { label: "Posturi si formare", id: "jobs" }]
  },
  {
    code: "D05", name: "Servicii publice", remit: "Acces, calitate si continuitate pentru sanatate, educatie si sprijin.", state: "Semnal local de acces",
    toolTitle: "Semnal de acces la un serviciu", toolDescription: "Noteaza un obstacol de acces si timpul de asteptare raportat voluntar. Nu introduce date despre un pacient, elev sau beneficiar.", actionLabel: "Trimite semnal demo",
    observation: "Unde si cand este greu sa ajungi la un serviciu?", boundary: "Nu invoca date clinice, nume, dosare scolare sau cazuri de beneficii.",
    fields: [
      { key: "service", label: "Tip de serviciu", type: "select", options: ["Sanatate", "Educatie", "Transport", "Locuire", "Deseuri", "Sprijin social", "Alt serviciu"], required: true },
      { key: "barrier", label: "Obstacol observat", type: "textarea", required: true, placeholder: "Descrie problema fara date personale", min: "20" },
      { key: "wait", label: "Asteptare aproximativa (minute)", type: "number", min: "0" },
      { key: "region", label: "Zona generala", type: "text", required: true, placeholder: "Judet sau localitate" }
    ]
  },
  {
    code: "D06", name: "Infrastructura", remit: "Transport, utilitati, active publice si mentenanta.", state: "Raport de mentenanta demo",
    toolTitle: "Raport de stare a infrastructurii", toolDescription: "Inregistreaza o problema generala la un activ public pentru triere locala.", actionLabel: "Inregistreaza raport",
    observation: "Ce activ sau serviciu necesita inspectie si reparatie?", boundary: "Nu publica detalii de securitate, coordonate precise ale infrastructurii critice sau informatii de acces restrictionat.",
    fields: [
      { key: "asset", label: "Tip activ", type: "select", options: ["Drum", "Pod", "Gara", "Statie", "Retea de apa", "Retea de energie", "Cladire publica", "Alt activ"], required: true },
      { key: "condition", label: "Stare observata", type: "select", options: ["Necesita inspectie", "Defect minor", "Defect major", "Serviciu intrerupt"], required: true },
      { key: "region", label: "Zona generala", type: "text", required: true, placeholder: "Judet / localitate" },
      { key: "evidence", label: "Sursa publica optionala", type: "url", placeholder: "https://..." }
    ]
  },
  {
    code: "D07", name: "Lanturi de aprovizionare", remit: "Origine, transformare, logistica, import si export.", state: "Trasabilitate demo",
    toolTitle: "Pas de productie si custodie", toolDescription: "Adauga un pas local intr-un lant de produs si indica ce intrare devine iesire.", actionLabel: "Adauga pas de lant",
    observation: "Ce intrare a fost transformata, de cine, in ce produs si pe baza carei dovezi?", boundary: "Nu expune identitatea lucratorilor, secrete comerciale sau locatii critice.",
    fields: [
      { key: "product", label: "Produs sau lot", type: "text", required: true, placeholder: "Identificator local al lotului" },
      { key: "step", label: "Pas", type: "select", options: ["Import", "Extractie", "Procesare", "Asamblare", "Transport", "Reutilizare", "Export", "Sfarsit de viata"], required: true },
      { key: "input", label: "Intrare → iesire", type: "text", required: true, placeholder: "Materiale si transformare" },
      { key: "source", label: "Dovada / sursa", type: "url", placeholder: "https://..." }
    ], links: [{ label: "Lant demo", id: "supply" }]
  },
  {
    code: "D08", name: "Mediu si resurse", remit: "Extractie, poluare, emisii, biodiversitate si refacere.", state: "Observatie de mediu demo",
    toolTitle: "Observatie asupra mediului", toolDescription: "Inregistreaza o observatie de mediu generala, cu data, zona, tipul de masurare si sursa.", actionLabel: "Salveaza observatie",
    observation: "Ce presiune asupra mediului s-a masurat, cu ce metoda si in ce perioada?", boundary: "Nu numi un rezultat ca poluare confirmata fara metoda, sursa si incertitudine.",
    fields: [
      { key: "medium", label: "Mediu observat", type: "select", options: ["Aer", "Apa", "Sol", "Padure", "Biodiversitate", "Deseuri", "Extractie resurse"], required: true },
      { key: "observation", label: "Observatie / valoare si unitate", type: "text", required: true, placeholder: "Valoare, unitate sau descriere" },
      { key: "observedAt", label: "Data observatiei", type: "date", required: true },
      { key: "source", label: "Metoda sau sursa", type: "url", placeholder: "https://..." }
    ]
  },
  {
    code: "D09", name: "Dezvoltare umana", remit: "Educatie, sanatate, competente si participare profesionala.", state: "Capacitate agregata demo",
    toolTitle: "Numaratoare agregata de specialisti", toolDescription: "Noteaza un numar agregat dupa specialitate si zona, cu definitie explicita pentru count.", actionLabel: "Salveaza agregatul demo",
    observation: "Numara persoane autorizate, posturi, echivalent norma intreaga sau ore disponibile?", boundary: "Nu introdu nume, date de sanatate, elevi individuali sau programul unei persoane.",
    fields: [
      { key: "profession", label: "Specialitate / ocupatie", type: "text", required: true, placeholder: "Ex. Cardiologie / inginerie civila" },
      { key: "count", label: "Numar agregat", type: "number", required: true, min: "0" },
      { key: "definition", label: "Ce numara valoarea?", type: "select", options: ["Persoane autorizate", "Posturi ocupate", "Echivalent norma intreaga", "Ore disponibile", "Absolventi / locuri de formare"], required: true },
      { key: "region", label: "Zona", type: "text", required: true, placeholder: "Judet / regiune" }
    ], links: [{ label: "Tabel de capacitati demo", id: "people" }]
  },
  {
    code: "D10", name: "Date si cunoastere", remit: "Surse, definitii, provenienta, metode si corectii.", state: "Catalog local de surse",
    toolTitle: "Inregistreaza o sursa de date", toolDescription: "Creeaza o fisa de catalog pentru o sursa candidata, licenta si stewardul responsabil.", actionLabel: "Adauga sursa in catalogul demo",
    observation: "Cine publica aceasta informatie si in ce conditii poate fi reutilizata?", boundary: "URL-ul singur nu acorda permisiunea de acces sau reutilizare.",
    fields: [
      { key: "title", label: "Titlul sursei", type: "text", required: true, placeholder: "Numele publicatiei sau setului de date" },
      { key: "url", label: "Pagina sursei", type: "url", required: true, placeholder: "https://..." },
      { key: "license", label: "Licenta / temei de utilizare", type: "text", required: true, placeholder: "Licenta publicata sau in verificare" },
      { key: "steward", label: "Steward / proprietar de date", type: "text", required: true, placeholder: "Institutie sau echipa" }
    ]
  },
  {
    code: "D11", name: "AI si suport decizional", remit: "Analiza limitata, citata, verificabila si contestabila.", state: "Rubrica umana demo",
    toolTitle: "Nota de analiza a unei afirmatii", toolDescription: "Inregistreaza o nota manuala pe dimensiunea selectata. Aceasta interfata nu apeleaza un model AI.", actionLabel: "Salveaza nota de analiza",
    observation: "Ce afirmatie, fragment, sursa si incertitudine sustin aceasta analiza?", boundary: "Nu eticheta autorul sau ideologia; nota nu este un verdict AI si nu poate schimba o decizie.",
    fields: [
      { key: "claim", label: "Afirmatie / fragment analizat", type: "textarea", required: true, min: "12", placeholder: "Fara date personale" },
      { key: "dimension", label: "Dimensiune", type: "select", options: ["Verificare factuala", "Presupunere", "Logica", "Atac personal", "Calitatea sursei", "Necesita abtinere"], required: true },
      { key: "finding", label: "Nota si incertitudine", type: "textarea", required: true, min: "10", placeholder: "Descrie ce ar trebui verificat de un om" },
      { key: "source", label: "Sursa", type: "url", placeholder: "https://..." }
    ], links: [{ label: "Dezbateri", id: "debates" }]
  },
  {
    code: "D12", name: "Masurare si evaluare", remit: "Indicatori, definitii, incertitudine si efecte observate.", state: "Registru de indicatori demo",
    toolTitle: "Defineste un indicator", toolDescription: "Creeaza o definitie de indicator inainte de a afisa o cifra: unitate, frecventa, sursa si limitarile masurarii.", actionLabel: "Inregistreaza definitia",
    observation: "Ce masoara indicatorul si ce actiuni poate sau nu poate declansa?", boundary: "Un indicator nu este un scor de cetatean si nu produce automat sanctiuni sau alocari.",
    fields: [
      { key: "name", label: "Numele indicatorului", type: "text", required: true, placeholder: "Ex. Timp median de asteptare" },
      { key: "unit", label: "Unitate / numitor", type: "text", required: true, placeholder: "Minute per cerere solutionata" },
      { key: "cadence", label: "Cadenta", type: "select", options: ["Zilnic", "Saptamanal", "Lunar", "Trimestrial", "Anual", "La eveniment"], required: true },
      { key: "limits", label: "Limita / incertitudine", type: "text", required: true, placeholder: "Acoperire, lipsuri sau confounderi" }
    ]
  },
  {
    code: "D13", name: "Transparenta si audit", remit: "Decizii explicate, istoric si verificare independenta.", state: "Jurnal local demo",
    toolTitle: "Intrare in jurnalul de transparenta", toolDescription: "Leaga o decizie de sursa, proprietar si data revizuirii; datele raman in browser.", actionLabel: "Adauga intrare demo",
    observation: "Cine a decis, in baza carui mandat si cand se revizuieste?", boundary: "Jurnalul local nu verifica autenticitatea si nu inlocuieste auditul independent.",
    fields: [
      { key: "reference", label: "Referinta deciziei", type: "text", required: true, placeholder: "ID public sau URL" },
      { key: "owner", label: "Organism responsabil", type: "text", required: true, placeholder: "Autoritatea decidenta" },
      { key: "basis", label: "Sursa / baza autoritatii", type: "url", placeholder: "https://..." },
      { key: "reviewDate", label: "Data revizuirii", type: "date" }
    ]
  },
  {
    code: "D14", name: "Procese si administratie", remit: "Cereri, termene, roluri, solutionare si apel.", state: "Flux problema-proiect disponibil",
    toolTitle: "Urmareste fluxul operational", toolDescription: "Deschide fluxul functional de raportare, triere, dovezi, optiuni, proiecte si jalonuri.", actionLabel: "Deschide fluxul civic",
    observation: "In ce etapa este o cerere si ce dovada permite trecerea mai departe?", boundary: "Scaffold-ul local nu emite autorizatii sau decizii oficiale.",
    fields: [], links: [{ label: "Probleme si proiecte", workflow: true }]
  },
  {
    code: "D15", name: "Simulare si digital twin", remit: "Scenarii, sensibilitate, alternative si ipoteze.", state: "Calculator simplu local",
    toolTitle: "Compara doua ipoteze numerice", toolDescription: "Calculeaza diferenta absoluta si procentuala dintre o baza si o alternativa; nu modeleaza efecte cauzale sau un sistem national.", actionLabel: "Calculeaza diferenta demo",
    observation: "Ce ipoteza si unitate sunt comparate si ce efecte raman in afara modelului?", boundary: "O diferenta aritmetica nu este simulare validata, prognoza sau autorizare.",
    fields: [
      { key: "scenario", label: "Numele scenariului", type: "text", required: true, placeholder: "Ex. Frecventa serviciului" },
      { key: "baseline", label: "Valoare de baza", type: "number", required: true },
      { key: "alternative", label: "Valoare alternativa", type: "number", required: true },
      { key: "unit", label: "Unitate si perioada", type: "text", required: true, placeholder: "Ex. minute / saptamana" }
    ], calculation: "delta"
  },
  {
    code: "D16", name: "Interfata cetateanului", remit: "Accesibilitate, informare, discutie si controlul contului.", state: "Raport de accesibilitate demo",
    toolTitle: "Raporteaza o bariera de acces", toolDescription: "Noteaza o problema de accesibilitate in interfata fara a trimite date despre tine sau alta persoana.", actionLabel: "Salveaza feedback demo",
    observation: "Ce pas, continut sau componenta impiedica accesul?", boundary: "Nu atasa documente de identitate sau informatii medicale; feedbackul nu este publicat automat.",
    fields: [
      { key: "barrier", label: "Bariera observata", type: "select", options: ["Navigare tastatura", "Cititor de ecran", "Contrast / text", "Limba si formulare", "Latime de banda", "Alt obstacol"], required: true },
      { key: "page", label: "Pagina sau pas", type: "text", required: true, placeholder: "Ex. Formular de contributie" },
      { key: "detail", label: "Ce ar ajuta?", type: "textarea", required: true, min: "10", placeholder: "Sugestie fara date personale" }
    ], links: [{ label: "Deschide interfata de proiecte", workflow: true }]
  },
  {
    code: "D17", name: "Finante publice", remit: "Bugete, executie, achizitii si rezultate.", state: "Calculator de buget local",
    toolTitle: "Urmareste o linie bugetara demo", toolDescription: "Compara o suma alocata si una cheltuita pentru o linie demonstrativa; nu verifica documente sau tranzactii.", actionLabel: "Salveaza calculul demo",
    observation: "Ce suma a fost autorizata, angajata, platita si ce rezultat public s-a livrat?", boundary: "Nu include conturi, date de plata sau documente confidentiale. Calculul nu autorizeaza cheltuieli.",
    fields: [
      { key: "line", label: "Program / linie", type: "text", required: true, placeholder: "Denumire publica" },
      { key: "allocated", label: "Alocat", type: "number", required: true, min: "0" },
      { key: "spent", label: "Cheltuit", type: "number", required: true, min: "0" },
      { key: "currency", label: "Moneda si perioada", type: "text", required: true, placeholder: "RON · anul bugetar" }
    ], calculation: "budget-balance"
  },
  {
    code: "D18", name: "Justitie si jurisprudenta", remit: "Informare juridica si navigarea proceselor legale.", state: "Index local de surse oficiale",
    toolTitle: "Index de intrebare juridica publica", toolDescription: "Inregistreaza o intrebare generala si un link catre o sursa oficiala. Nu crea un dosar despre o persoana.", actionLabel: "Adauga intrebare generala",
    observation: "Care este sursa oficiala, versiunea si data efectiva a regulii?", boundary: "Acest index nu furnizeaza consiliere juridica si nu contine date despre cazuri individuale.",
    fields: [
      { key: "topic", label: "Subiect juridic general", type: "text", required: true, placeholder: "Ex. procedura de contestatie" },
      { key: "question", label: "Intrebare de clarificat", type: "textarea", required: true, min: "10", placeholder: "Fara nume sau detalii de dosar" },
      { key: "source", label: "Sursa oficiala", type: "url", required: true, placeholder: "https://..." },
      { key: "effective", label: "Data de verificat", type: "date" }
    ]
  },
  {
    code: "D19", name: "Aparare si securitate", remit: "Pregatire civila si continuitate sigura a serviciilor.", state: "Lista de pregatire civila",
    toolTitle: "Lista de pregatire si continuitate", toolDescription: "Urmareste pasi generali de pregatire pentru intreruperi de serviciu, dezastre sau urgenta civila.", actionLabel: "Adauga element in lista",
    observation: "Ce serviciu esential trebuie mentinut si ce pregatire publica lipseste?", boundary: "Nu introduce instalatii, capacitati, efective, slabiciuni operative sau detalii de aparare.",
    fields: [
      { key: "area", label: "Zona de pregatire", type: "select", options: ["Apa si provizii", "Comunicare", "Prim ajutor", "Adapost si accesibilitate", "Continuitate scoala", "Continuitate serviciu public"], required: true },
      { key: "task", label: "Pas general de verificat", type: "text", required: true, placeholder: "Ex. instructiuni publice actualizate" },
      { key: "status", label: "Stare", type: "select", options: ["De pregatit", "In verificare", "Gata"], required: true },
      { key: "publicSource", label: "Indrumare publica", type: "url", placeholder: "https://..." }
    ]
  },
  {
    code: "D20", name: "Diplomatie si relatii externe", remit: "Tratate, cooperare, comert extern si schimb de date.", state: "Index local de acorduri publice",
    toolTitle: "Urmareste un acord sau parteneriat", toolDescription: "Creeaza o nota pentru o intelegere publica, domeniul ei si sursa oficiala de urmarire.", actionLabel: "Adauga acord in indexul demo",
    observation: "Ce angajament, termen, responsabil si rezultat public pot fi urmarite?", boundary: "Nu publica negocieri confidentiale, comunicari diplomatice sau date de securitate.",
    fields: [
      { key: "agreement", label: "Acord / partener", type: "text", required: true, placeholder: "Denumire publica" },
      { key: "area", label: "Domeniu", type: "select", options: ["Comert", "Energie", "Educatie si cercetare", "Mediu", "Aparare colectiva", "Schimb de date", "Alt domeniu"], required: true },
      { key: "source", label: "Sursa oficiala", type: "url", required: true, placeholder: "https://..." },
      { key: "reviewDate", label: "Data urmatoarei revizuiri", type: "date" }
    ]
  }
];

function readEntries(): LocalEntry[] {
  try {
    const value = localStorage.getItem(storageKey);
    if (!value) return [];
    const parsed = JSON.parse(value) as LocalEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function storeEntries(entries: LocalEntry[]) {
  try { localStorage.setItem(storageKey, JSON.stringify(entries)); } catch { /* state still works until page reload */ }
}

const statusLabels: Record<EntryStatus, string> = { NEW: "Nou", IN_REVIEW: "In analiza", RECORDED: "Inregistrat" };

export function DomainWorkbench({ onOpenModule, onOpenWorkflow }: {
  onOpenModule: (id: ModuleLinkId) => void;
  onOpenWorkflow: () => void;
}) {
  const [selectedCode, setSelectedCode] = useState("D01");
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<LocalEntry[]>(readEntries);
  const [message, setMessage] = useState("");
  const selectedDomain = domains.find((domain) => domain.code === selectedCode) ?? domains[0];
  const filteredDomains = useMemo(() => domains.filter((domain) => `${domain.code} ${domain.name} ${domain.remit}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const domainEntries = entries.filter((entry) => entry.domain === selectedDomain.code);

  const saveEntries = (update: (current: LocalEntry[]) => LocalEntry[]) => setEntries((current) => {
    const next = update(current);
    storeEntries(next);
    return next;
  });

  const submitEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values: Record<string, string> = {};
    selectedDomain.fields.forEach((field) => { values[field.key] = String(data.get(field.key) ?? "").trim(); });
    const entry: LocalEntry = { id: crypto.randomUUID(), domain: selectedDomain.code, values, status: "NEW", createdAt: new Date().toISOString() };
    saveEntries((current) => [entry, ...current]);
    form.reset();
    setMessage(`Intrare ${selectedDomain.code} salvata numai in acest browser.`);
  };

  const updateStatus = (entryId: string, status: EntryStatus) => {
    saveEntries((current) => current.map((entry) => entry.id === entryId ? { ...entry, status } : entry));
  };

  const removeEntry = (entryId: string) => {
    saveEntries((current) => current.filter((entry) => entry.id !== entryId));
    setMessage("Intrarea locala a fost stearsa din browser.");
  };

  const resetDomainEntries = () => {
    saveEntries((current) => current.filter((entry) => entry.domain !== selectedDomain.code));
    setMessage(`Intrari locale ${selectedDomain.code} sterse.`);
  };

  return <>
    <div className="module-heading"><p className="os-eyebrow">D01–D20 · WORKSPACE-URI FUNCTIONALE DEMO</p><h2>Un punct de lucru pentru fiecare domeniu</h2><p>Alege un domeniu, foloseste instrumentul lui minimal si urmareste intrarile locale printr-un ciclu de triere. Fiecare are un scop si limite specifice.</p></div>
    <div className="os-data-warning"><strong>Stocare de prototip:</strong> datele se pastreaza in localStorage-ul acestui browser, fara autentificare, backend, validare institutionala sau transfer catre un serviciu national. Foloseste doar exemple fictive; nu introduce informatii personale, confidentiale sau operationale sensibile.</div>
    <label className="domain-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cauta cod, domeniu sau responsabilitate" /></label>
    <div className="domain-directory-grid">{filteredDomains.map((domain) => <button className={`domain-tile domain-select ${domain.code === selectedDomain.code ? "active" : ""}`} key={domain.code} onClick={() => { setSelectedCode(domain.code); setMessage(""); }} aria-pressed={domain.code === selectedDomain.code}>
      <div><span className="domain-code">{domain.code}</span><span className="phase-chip phase-demo">{domain.state}</span></div>
      <h3>{domain.name}</h3><p>{domain.remit}</p><small><span className="status-dot gray" /> {entries.filter((entry) => entry.domain === domain.code).length} intrari locale</small>
    </button>)}</div>

    <section className="os-panel domain-workspace-panel">
      <div className="domain-workspace-header"><div><p className="os-eyebrow">{selectedDomain.code} · {selectedDomain.name.toUpperCase()}</p><h3>{selectedDomain.toolTitle}</h3><p>{selectedDomain.toolDescription}</p></div><span className="status-chip status-chip-warn">DOAR IN ACEST BROWSER</span></div>
      {selectedDomain.links && <div className="domain-tool-links">{selectedDomain.links.map((link) => <button className="button button-outline button-small" key={link.label} onClick={() => link.workflow ? onOpenWorkflow() : link.id && onOpenModule(link.id)}>{link.label} →</button>)}</div>}
      {selectedDomain.fields.length > 0 && <form className="domain-tool-form" onSubmit={submitEntry}>
        {selectedDomain.fields.map((field) => <label className={field.type === "textarea" ? "wide-field" : ""} key={field.key}>{field.label}
          {field.type === "textarea" ? <textarea name={field.key} required={field.required ?? false} minLength={field.min ? Number(field.min) : undefined} maxLength={field.max ? Number(field.max) : undefined} rows={3} placeholder={field.placeholder} />
            : field.type === "select" ? <select name={field.key} required={field.required ?? false}><option value="">Alege</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select>
              : <input name={field.key} type={field.type} required={field.required ?? false} min={field.type === "number" ? field.min : undefined} max={field.type === "number" ? field.max : undefined} minLength={field.type === "text" ? (field.min ? Number(field.min) : undefined) : undefined} maxLength={field.type === "text" ? (field.max ? Number(field.max) : undefined) : undefined} placeholder={field.placeholder} step={field.type === "number" ? "any" : undefined} />}
        </label>)}
        <button className="button button-primary button-small wide-field" type="submit">{selectedDomain.actionLabel}</button>
      </form>}
      {selectedDomain.fields.length === 0 && <div className="domain-no-form"><span>↗</span><p>Acest domeniu are deja un modul demonstrativ dedicat, afisat deasupra.</p></div>}
      <div className="domain-loop-note"><div><span>OBSERVA</span><strong>{selectedDomain.observation}</strong></div><div><span>LIMITA</span><strong>{selectedDomain.boundary}</strong></div></div>
      {message && <div className="os-local-notice" role="status">{message}<button onClick={() => setMessage("")}>Inchide</button></div>}
      <div className="domain-entry-header"><div><span className="os-eyebrow">LOCAL ACTIVITY</span><h4>Intrari si etape</h4></div><div className="domain-entry-controls"><span>{domainEntries.length} salvate</span>{domainEntries.length > 0 && <button className="text-button" onClick={resetDomainEntries}>Sterge intrarile {selectedDomain.code}</button>}</div></div>
      <div className="domain-entry-list">{domainEntries.length === 0 && <div className="empty-state compact"><p>Nu exista intrari locale pentru acest domeniu. Foloseste formularul de mai sus cu valori demonstrative.</p></div>}
        {domainEntries.map((entry) => <DomainEntryCard key={entry.id} domain={selectedDomain} entry={entry} onStatusChange={updateStatus} onDelete={removeEntry} />)}
      </div>
    </section>
  </>;
}

function DomainEntryCard({ domain, entry, onStatusChange, onDelete }: {
  domain: DomainSpec; entry: LocalEntry; onStatusChange: (id: string, status: EntryStatus) => void; onDelete: (id: string) => void;
}) {
  const primaryField = domain.fields[0];
  const headline = primaryField ? entry.values[primaryField.key] : domain.toolTitle;
  let calculated = "";
  if (domain.calculation === "delta") {
    const base = Number(entry.values.baseline);
    const option = Number(entry.values.alternative);
    if (Number.isFinite(base) && Number.isFinite(option)) {
      const delta = option - base;
      const percent = base === 0 ? "procent indisponibil (baza zero)" : `${((delta / Math.abs(base)) * 100).toFixed(1)}% fata de baza`;
      calculated = `Diferenta aritmetica: ${delta >= 0 ? "+" : ""}${delta} ${entry.values.unit}. ${percent}.`;
    }
  } else if (domain.calculation === "budget-balance") {
    const balance = Number(entry.values.allocated) - Number(entry.values.spent);
    if (Number.isFinite(balance)) calculated = `Diferenta demonstrativa alocat minus cheltuit: ${balance.toFixed(2)} ${entry.values.currency}.`;
  }
  return <article className="domain-entry-card">
    <div className="domain-entry-card-head"><div><strong>{headline || domain.name}</strong><small>{new Intl.DateTimeFormat("ro-RO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.createdAt))}</small></div><span className={`entry-status status-${entry.status.toLowerCase()}`}>{statusLabels[entry.status]}</span></div>
    <dl className="domain-entry-values">{domain.fields.filter((field) => field.key !== primaryField?.key && entry.values[field.key]).map((field) => <div key={field.key}><dt>{field.label}</dt><dd>{entry.values[field.key]}</dd></div>)}</dl>
    {calculated && <p className="domain-calculation">{calculated}</p>}
    <div className="domain-entry-actions">
      {entry.status === "NEW" && <button className="button button-outline button-small" onClick={() => onStatusChange(entry.id, "IN_REVIEW")}>Preia in analiza</button>}
      {entry.status === "IN_REVIEW" && <button className="button button-primary button-small" onClick={() => onStatusChange(entry.id, "RECORDED")}>Inregistreaza rezultat</button>}
      {entry.status === "RECORDED" && <button className="text-button" onClick={() => onStatusChange(entry.id, "NEW")}>Redeschide</button>}
      <button className="text-button delete-local-entry" onClick={() => onDelete(entry.id)}>Sterge</button>
    </div>
  </article>;
}
