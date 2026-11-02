import { useEffect, useMemo, useState } from "react";

type ProductPlan = {
  id: string;
  product: string;
  marketPrice: number;
  plannedPrice: number;
  unitsPerMonth: number;
  materialsPerUnit: number;
  hoursPerUnit: number;
  localMaterialSharePct: number;
  materialOrigin: string;
  comparisonSource: string;
};

type ApprovalStatus = "VERIFY" | "IN_PROGRESS" | "RECORDED" | "NOT_APPLICABLE";
type ApprovalRecord = { id: string; status: ApprovalStatus; reference: string; sourceUrl: string; documentsDone: string[] };

interface BusinessPlan {
  location: string;
  legalForm: string;
  premisesMode: "rent" | "buy";
  spaceSqm: number;
  monthlyRent: number;
  depositMonths: number;
  purchasePrice: number;
  monthlyPropertyLoan: number;
  fitoutCost: number;
  paidRoles: number;
  loadedCostPerRole: number;
  productiveHoursPerRole: number;
  electricity: number;
  water: number;
  heating: number;
  internet: number;
  equipmentInvestment: number;
  toolsInvestment: number;
  openingMaterials: number;
  setupProfessionals: number;
  openingCashReserve: number;
  maintenance: number;
  insurance: number;
  accounting: number;
  marketing: number;
  logistics: number;
  otherMonthly: number;
  exportSalesPct: number;
  products: ProductPlan[];
  approvals: ApprovalRecord[];
}

type ApprovalSpec = { id: string; title: string; authority: string; condition: string; prepare: string; documents: string[]; sourceLabel: string; sourceUrl?: string };

const storageKey = "polisos.business-planner.tailoring.v1";

const approvalSpecs: ApprovalSpec[] = [
  { id: "activity-code", title: "Alege forma juridică și verifică activitățile CAEN Rev. 3", authority: "ONRC · nomenclator CAEN", condition: "Pas de pornire; forma și codurile depind de activitatea și modul real de operare.", prepare: "Lista serviciilor (reparații, croitorie la comandă, producție, comerț), forma dorită, adresa și întrebările pentru registrator/consultant.", documents: ["Descrierea exactă a serviciilor și produselor", "Codurile CAEN consultate și data verificării", "Întrebările despre autorizarea activităților la sediu și la punctul de lucru"], sourceLabel: "Caută codurile CAEN la ONRC", sourceUrl: "https://caen.onrc.ro/" },
  { id: "registration", title: "Înregistrare entitate și declararea locurilor de desfășurare", authority: "ONRC", condition: "Documentele depind de forma juridică, asociați, sediu, punct de lucru și activitate.", prepare: "Cererea și actele cerute pentru forma aleasă; dovada dreptului de folosință asupra sediului/spațiului și declarațiile aplicabile.", documents: ["Lista ONRC actuală pentru forma juridică aleasă", "Dovada dreptului de folosință pentru sediu și spațiu, dacă este cerută", "Act constitutiv, declarații și formulare conform listei actuale ONRC", "Confirmarea codurilor CAEN și a locurilor de desfășurare declarate"], sourceLabel: "Portal și ghiduri ONRC", sourceUrl: "https://www.onrc.ro/" },
  { id: "premises", title: "Verifică destinația spațiului și lucrările de amenajare", authority: "Primăria locală · urbanism / disciplina în construcții", condition: "În funcție de clădire, destinație, schimbarea de folosință și lucrările propuse.", prepare: "Contract de închiriere sau act de proprietate, planul spațiului, activitatea propusă și descrierea lucrărilor; cere în scris lista locală aplicabilă.", documents: ["Contractul sau actul care dovedește dreptul de folosință", "Planul spațiului și destinația autorizată cunoscută", "Descrierea lucrărilor și a echipamentelor instalate", "Răspunsul scris al autorității privind schimbarea de destinație și aprobările aplicabile"], sourceLabel: "Adaugă pagina oficială a primăriei din localitatea aleasă" },
  { id: "local-operation", title: "Cere lista locală de acorduri, notificări și reguli de funcționare", authority: "Primărie / autoritate locală", condition: "Poate depinde de localitate, program, firmă, afișaj, vânzare directă și specificul activității.", prepare: "Adresa exactă, suprafața, activitățile CAEN, programul propus, firmă și modalitatea de vânzare.", documents: ["Adresa, suprafața și datele entității", "Activitățile CAEN și descrierea fluxului de lucru", "Programul și modalitatea de vânzare propuse", "Lista locală curentă de cereri, taxe și termene, confirmată de primărie"], sourceLabel: "Adaugă pagina oficială a autorității locale" },
  { id: "fire", title: "Cere încadrarea spațiului la securitate la incendiu", authority: "ISU județean / București-Ilfov", condition: "Nu se presupune că un atelier mic intră automat la autorizare; se verifică destinația, suprafața, clădirea și lucrările față de normele curente.", prepare: "Plan, suprafață, destinație, număr de persoane, echipamente, instalații și documentele spațiului; solicită confirmarea proiectantului/ISU.", documents: ["Plan și suprafață utilă, destinație și numărul maxim de persoane", "Lista utilajelor, instalațiilor și materialelor depozitate", "Date despre construcție și eventualele lucrări", "Răspunsul proiectantului autorizat sau al ISU privind încadrarea și documentația cerută"], sourceLabel: "Informații oficiale IGSU", sourceUrl: "https://isuvn.igsu.ro/avizare-autorizare/informare-376" },
  { id: "employment", title: "Pregătește documentele de angajare înainte de primul schimb", authority: "Inspecția Muncii · REGES-ONLINE", condition: "Se aplică dacă firma are salariați; tipurile de contract și obligațiile depind de situația de muncă.", prepare: "Contract semnat, fișa postului, înregistrările cerute înainte de începerea activității și confirmarea cerințelor de securitate și sănătate în muncă.", documents: ["Contractul și fișa postului pentru fiecare rol", "Înregistrarea cerută în REGES-ONLINE înainte de data începerii", "Dovezile de instruire și evaluările SSM aplicabile", "Confirmările de medicina muncii și program de lucru, după caz"], sourceLabel: "Codul muncii și REGES-ONLINE", sourceUrl: "https://reges.inspectiamuncii.ro/informatii-utile/codul-muncii/?faqid=8035" },
  { id: "fiscal", title: "Configurează evidența fiscală, facturarea și încasările", authority: "ANAF", condition: "Cerințele diferă după forma juridică, canalul de vânzare, metoda de încasare și situația fiscală; verifică regulile în vigoare.", prepare: "Datele firmei, facturarea, fluxul de încasări, metoda de plată, contabilitatea și confirmarea obligațiilor e-Factura/casă de marcat unde sunt aplicabile.", documents: ["Regimul fiscal și calendarul obligațiilor confirmate cu contabilul/ANAF", "Flux de facturare și documente pentru fiecare canal de vânzare", "Încadrarea la e-Factura și aparat de marcat pentru metodele folosite", "Procedură de evidență a încasărilor și cheltuielilor"], sourceLabel: "Servicii și informații ANAF", sourceUrl: "https://www.anaf.ro/" },
  { id: "waste", title: "Organizează deșeurile textile și contractele de colectare", authority: "Primărie / operator de salubritate / autoritate de mediu", condition: "Separă deșeurile obișnuite de orice obligație legată de volume, ambalaje sau activitate specifică.", prepare: "Tipurile și volumele de resturi, reutilizare posibilă, contractul de colectare și confirmarea încadrării la autoritățile relevante.", documents: ["Lista tipurilor de deșeuri și volumele estimate", "Planul de reutilizare, colectare selectivă și depozitare", "Contractele/confirmările operatorilor pentru categoriile aplicabile", "Încadrarea obligațiilor pentru ambalaje și raportări, dacă este cazul"], sourceLabel: "Adaugă sursa autorității locale sau de mediu" },
  { id: "consumer", title: "Verifică informarea clienților și cerințele produselor vândute", authority: "ANPC / autoritate competentă pentru produs", condition: "Relevant dacă atelierul vinde produse; drepturile consumatorilor și informațiile textile depind de produs și canal.", prepare: "Descrierea produsului, compoziția și instrucțiunile de întreținere primite de la furnizor, prețuri, condiții de comandă și retur.", documents: ["Fișele tehnice și compoziția materialelor de la furnizori", "Etichetele și instrucțiunile pregătite pentru produse", "Lista de prețuri și termenii de comandă/livrare", "Procedura de reclamații, garanții și retururi, după canal"], sourceLabel: "Informații ANPC", sourceUrl: "https://anpc.ro/" },
  { id: "industrial-license", title: "Verifică dacă activitatea intră în licențiere industrială", authority: "PCUEL · autorități de avizare", condition: "Nu presupune că un atelier de croitorie necesită licență industrială unică; verifică domeniul și activitățile licențiate.", prepare: "Descrierea tehnică a activității, capacitatea, instalațiile și codurile CAEN planificate.", documents: ["Descrierea proceselor de producție și capacitatea maximă estimată", "Codurile CAEN și lista instalațiilor/utilajelor", "Consumurile de energie, materiale și fluxurile de deșeuri", "Răspunsul autorității privind aplicabilitatea licenței industriale"], sourceLabel: "Punct unic electronic pentru licența industrială", sourceUrl: "https://pcuel.oli.gov.ro/ro/" }
];

function emptyApprovals(): ApprovalRecord[] {
  return approvalSpecs.map((item) => ({ id: item.id, status: "VERIFY", reference: "", sourceUrl: item.sourceUrl ?? "", documentsDone: [] }));
}

function defaults(): BusinessPlan {
  return {
    location: "Brașov · scenariu demonstrativ",
    legalForm: "SRL · de confirmat",
    premisesMode: "rent",
    spaceSqm: 60,
    monthlyRent: 2600,
    depositMonths: 2,
    purchasePrice: 280000,
    monthlyPropertyLoan: 0,
    fitoutCost: 20000,
    paidRoles: 2,
    loadedCostPerRole: 5800,
    productiveHoursPerRole: 130,
    electricity: 900,
    water: 100,
    heating: 650,
    internet: 100,
    equipmentInvestment: 45000,
    toolsInvestment: 8000,
    openingMaterials: 12000,
    setupProfessionals: 5000,
    openingCashReserve: 30000,
    maintenance: 350,
    insurance: 250,
    accounting: 500,
    marketing: 400,
    logistics: 250,
    otherMonthly: 500,
    exportSalesPct: 0,
    products: [
      { id: "alterations", product: "Retușuri și reparații", marketPrice: 90, plannedPrice: 85, unitsPerMonth: 100, materialsPerUnit: 6, hoursPerUnit: 0.75, localMaterialSharePct: 80, materialOrigin: "Ateliere și mercerii locale · de confirmat", comparisonSource: "Editează: ofertă publică / dată / localitate" },
      { id: "custom", product: "Haine la comandă", marketPrice: 500, plannedPrice: 480, unitsPerMonth: 35, materialsPerUnit: 145, hoursPerUnit: 4, localMaterialSharePct: 55, materialOrigin: "Furnizor și țară de origine · de completat", comparisonSource: "Editează: ofertă publică / dată / localitate" },
      { id: "uniforms", product: "Uniforme și îmbrăcăminte de lucru", marketPrice: 220, plannedPrice: 210, unitsPerMonth: 70, materialsPerUnit: 80, hoursPerUnit: 2, localMaterialSharePct: 65, materialOrigin: "Furnizor și țară de origine · de completat", comparisonSource: "Editează: ofertă publică / dată / localitate" }
    ],
    approvals: emptyApprovals()
  };
}

function readPlan(): BusinessPlan {
  const base = defaults();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as Partial<BusinessPlan> | null;
    if (!saved) return base;
    const products = Array.isArray(saved.products) ? saved.products : base.products;
    const approvals = Array.isArray(saved.approvals) ? saved.approvals : base.approvals;
    return {
      ...base,
      ...saved,
      products: base.products.map((item) => {
        const savedItem = products.find((candidate) => candidate.id === item.id);
        const savedShare = Number(savedItem?.localMaterialSharePct ?? item.localMaterialSharePct);
        return savedItem ? { ...item, ...savedItem, localMaterialSharePct: Number.isFinite(savedShare) ? Math.max(0, Math.min(100, savedShare)) : item.localMaterialSharePct, materialOrigin: savedItem.materialOrigin ?? item.materialOrigin } : item;
      }),
      exportSalesPct: Math.max(0, Math.min(100, Number(saved.exportSalesPct ?? base.exportSalesPct) || 0)),
      approvals: approvalSpecs.map((spec) => {
        const defaultItem = base.approvals.find((item) => item.id === spec.id)!;
        const savedItem = approvals.find((item) => item.id === spec.id);
        return savedItem ? { ...defaultItem, ...savedItem, documentsDone: Array.isArray(savedItem.documentsDone) ? savedItem.documentsDone : [] } : defaultItem;
      })
    } as BusinessPlan;
  } catch {
    return base;
  }
}

function numeric(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function money(value: number) {
  return new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 }).format(Math.round(value));
}

function calculate(plan: BusinessPlan, demandMultiplier = 1, priceMultiplier = 1, materialMultiplier = 1) {
  const demandHours = plan.products.reduce((sum, item) => sum + item.unitsPerMonth * demandMultiplier * item.hoursPerUnit, 0);
  const availableHours = plan.paidRoles * plan.productiveHoursPerRole;
  const capacityFactor = demandHours > availableHours && demandHours > 0 ? availableHours / demandHours : 1;
  const rows = plan.products.map((item) => {
    const units = item.unitsPerMonth * demandMultiplier * capacityFactor;
    const price = item.plannedPrice * priceMultiplier;
    const revenue = units * price;
    const materials = units * item.materialsPerUnit * materialMultiplier;
    const localMaterials = materials * Math.max(0, Math.min(100, item.localMaterialSharePct)) / 100;
    return { ...item, feasibleUnits: units, revenue, materials, localMaterials, externalOrUnknownMaterials: materials - localMaterials, domesticSales: revenue * (1 - plan.exportSalesPct / 100), exportSales: revenue * plan.exportSalesPct / 100, contribution: revenue - materials };
  });
  const revenue = rows.reduce((sum, item) => sum + item.revenue, 0);
  const materials = rows.reduce((sum, item) => sum + item.materials, 0);
  const localMaterials = rows.reduce((sum, item) => sum + item.localMaterials, 0);
  const externalOrUnknownMaterials = materials - localMaterials;
  const domesticSales = rows.reduce((sum, item) => sum + item.domesticSales, 0);
  const exportSales = rows.reduce((sum, item) => sum + item.exportSales, 0);
  const contribution = revenue - materials;
  const occupancy = plan.premisesMode === "rent" ? plan.monthlyRent : plan.monthlyPropertyLoan;
  const utilities = plan.electricity + plan.water + plan.heating + plan.internet;
  const personnel = plan.paidRoles * plan.loadedCostPerRole;
  const otherFixed = plan.maintenance + plan.insurance + plan.accounting + plan.marketing + plan.logistics + plan.otherMonthly;
  const fixedCosts = occupancy + utilities + personnel + otherFixed;
  const operatingResult = contribution - fixedCosts;
  const contributionRate = revenue > 0 ? contribution / revenue : 0;
  const breakEvenRevenue = contributionRate > 0 ? fixedCosts / contributionRate : 0;
  const actualHours = rows.reduce((sum, item) => sum + item.feasibleUnits * item.hoursPerUnit, 0);
  const totalUnits = rows.reduce((sum, item) => sum + item.feasibleUnits, 0);
  const contributionPerUnit = totalUnits > 0 ? contribution / totalUnits : 0;
  const breakEvenUnits = contributionPerUnit > 0 ? fixedCosts / contributionPerUnit : 0;
  const deposit = plan.premisesMode === "rent" ? plan.monthlyRent * plan.depositMonths : plan.purchasePrice;
  const startupInvestment = deposit + plan.fitoutCost + plan.equipmentInvestment + plan.toolsInvestment + plan.openingMaterials + plan.setupProfessionals + plan.openingCashReserve;
  return { rows, demandHours, availableHours, actualHours, capacityFactor, revenue, materials, localMaterials, externalOrUnknownMaterials, domesticSales, exportSales, contribution, fixedCosts, operatingResult, breakEvenRevenue, breakEvenUnits, utilities, personnel, occupancy, startupInvestment, totalUnits };
}

function NumberField({ label, value, onChange, suffix = "RON / lună", min = 0 }: { label: string; value: number; onChange: (value: number) => void; suffix?: string; min?: number }) {
  return <label className="business-number-field"><span>{label}</span><div><input type="number" min={min} step="any" value={value} onChange={(event) => onChange(numeric(event.target.value))} /><small>{suffix}</small></div></label>;
}

export function BusinessPlanner() {
  const [plan, setPlan] = useState<BusinessPlan>(readPlan);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(plan)); } catch { /* calculation remains available for this page load */ }
  }, [plan]);

  const result = useMemo(() => calculate(plan), [plan]);
  const scenarios = useMemo(() => [
    { name: "Cerere prudentă", result: calculate(plan, 0.75, 0.95, 1.15) },
    { name: "Ipoteza introdusă", result: calculate(plan) },
    { name: "Cerere în creștere", result: calculate(plan, 1.2, 1.03, 1.08) }
  ], [plan]);
  const doneApprovals = plan.approvals.filter((item) => item.status === "RECORDED" || item.status === "NOT_APPLICABLE").length;
  const revenueScale = Math.max(1, result.revenue, result.breakEvenRevenue);
  const revenueBar = Math.min(100, result.revenue / revenueScale * 100);
  const breakEvenMarker = Math.min(100, result.breakEvenRevenue / revenueScale * 100);

  const update = <K extends keyof BusinessPlan>(key: K, value: BusinessPlan[K]) => setPlan((current) => ({ ...current, [key]: value }));
  const updateProduct = <K extends keyof ProductPlan>(id: string, key: K, value: ProductPlan[K]) => setPlan((current) => ({
    ...current,
    products: current.products.map((item) => item.id === id ? { ...item, [key]: value } : item)
  }));
  const updateApproval = <K extends keyof ApprovalRecord>(id: string, key: K, value: ApprovalRecord[K]) => setPlan((current) => ({
    ...current,
    approvals: current.approvals.map((item) => item.id === id ? { ...item, [key]: value } : item)
  }));
  const toggleApprovalDocument = (approvalId: string, documentId: string) => setPlan((current) => ({
    ...current,
    approvals: current.approvals.map((item) => {
      if (item.id !== approvalId) return item;
      const completed = item.documentsDone ?? [];
      return { ...item, documentsDone: completed.includes(documentId) ? completed.filter((id) => id !== documentId) : [...completed, documentId] };
    })
  }));
  const reset = () => {
    try { localStorage.removeItem(storageKey); } catch { /* reset remains available for this page load */ }
    setPlan(defaults());
    setNotice("Ipotezele exemplu au fost restabilite.");
  };

  return <main className="business-planner-page">
    <section className="business-planner-heading">
      <div><p className="balance-eyebrow">ECONOMIE PRODUCTIVĂ · MODEL DE AFACERE</p><h1>Poate atelierul să se susțină?</h1><p>Construiește un scenariu pentru un atelier de croitorie: investiția inițială, costurile lunare, capacitatea de producție, prețurile pieței și volumul de vânzări necesar.</p></div>
      <div className="business-local-badge"><span>MODEL LOCAL</span><strong>Plan de lucru · nu prognoză</strong><small>Salvat doar în acest browser</small></div>
    </section>

    <div className="business-disclaimer"><strong>Scenariu ilustrativ.</strong> Valorile sunt exemple editabile, nu oferte actuale, statistici de piață, costuri salariale legale, previziune sau consultanță. Nu există surse de preț ori cerere conectate. Autorizațiile și documentele depind de forma juridică, activitatea reală, localitate și spațiu; lista de mai jos este un ghid de verificare, nu confirmarea că toate avizele se aplică.</div>

    <div className="business-toolbar"><label>Localitate și scenariu<input value={plan.location} onChange={(event) => update("location", event.target.value)} /></label><label>Formă avută în vedere<input value={plan.legalForm} onChange={(event) => update("legalForm", event.target.value)} /></label><button className="button button-outline button-small" onClick={reset}>Resetează exemplul</button></div>
    {notice && <div className="os-local-notice" role="status">{notice}</div>}

    <section className="business-kpi-grid" aria-label="Rezumatul modelului de afacere">
      <BusinessKpi label="Capital de pornire estimat" value={result.startupInvestment} detail="Spațiu + amenajare + utilaje + materiale + rezervă" />
      <BusinessKpi label="Costuri fixe lunare" value={result.fixedCosts} detail="Personal + spațiu + utilități + administrare" />
      <BusinessKpi label="Venit lunar la capacitatea modelată" value={result.revenue} detail={`${money(result.totalUnits)} produse / servicii fezabile`} />
      <BusinessKpi label="Rezultat operațional estimat" value={result.operatingResult} detail="După materiale directe și costuri fixe; înainte de taxe și amortizare" tone={result.operatingResult < 0 ? "loss" : "gain"} />
    </section>

    <section className="business-flow-panel">
      <div className="balance-section-heading"><div><p className="balance-eyebrow">MODEL DE VIABILITATE · LUNAR</p><h2>Investiție → producție → clienți → echilibru</h2></div><span className="balance-units">RON / lună · scenariu editabil</span></div>
      <div className="business-flow-visual">
        <article className="business-flow-node capital"><span>1 · ÎNAINTE DE DESCHIDERE</span><strong>{money(result.startupInvestment)} RON</strong><small>capital estimat de pornire</small></article>
        <div className="business-flow-connector"><span>utilaje + echipă + materiale</span><b>→</b></div>
        <article className="business-flow-node operations"><span>2 · COST LUNAR DE OPERARE</span><strong>{money(result.fixedCosts + result.materials)} RON</strong><small>{money(result.fixedCosts)} fixe + {money(result.materials)} materiale directe</small></article>
        <div className="business-flow-connector"><span>{money(result.totalUnits)} unități fezabile</span><b>→</b></div>
        <article className="business-flow-node sales"><span>3 · VÂNZĂRI LA IPOTEZELE DATE</span><strong>{money(result.revenue)} RON</strong><small>{money(result.operatingResult)} rezultat operațional estimat</small></article>
      </div>
      <div className="break-even-panel">
        <div><strong>{result.operatingResult >= 0 ? "Peste pragul de echilibru operațional" : "Sub pragul de echilibru operațional"}</strong><span>Venit estimat: {money(result.revenue)} RON · venit aproximativ de echilibru: {money(result.breakEvenRevenue)} RON</span></div>
        <div className="break-even-track" role="img" aria-label={`Venit prognozat ${money(result.revenue)} RON, prag aproximativ ${money(result.breakEvenRevenue)} RON`}><div className="break-even-fill" style={{ width: `${revenueBar}%` }} /><i className="break-even-marker" style={{ left: `${breakEvenMarker}%` }} /><span>VENIT</span><b style={{ left: `${breakEvenMarker}%` }}>ECHILIBRU</b></div>
        <small>Pragul este calculat din marja de contribuție a produselor și costurile fixe introduse. Nu include impozite, amortizare, variația stocurilor sau o remunerație a fondatorului decât dacă o adaugi la costurile de personal.</small>
      </div>
    </section>

    <div className="business-workspace-grid">
      <section className="os-panel business-input-panel">
        <div className="panel-title"><span>INVESTIȚIE ȘI RESURSE</span><h3>Ce costă să deschizi și să funcționezi</h3></div>
        <div className="business-input-group">
          <h4>Spațiul</h4>
          <label className="business-mode-picker"><span>Închiriere</span><input name="premises-mode" type="radio" checked={plan.premisesMode === "rent"} onChange={() => update("premisesMode", "rent")} /><span>Cumpărare</span><input name="premises-mode" type="radio" checked={plan.premisesMode === "buy"} onChange={() => update("premisesMode", "buy")} /></label>
          <div className="business-fields-grid"><NumberField label="Suprafață" value={plan.spaceSqm} suffix="m²" onChange={(value) => update("spaceSqm", value)} />
            {plan.premisesMode === "rent" ? <><NumberField label="Chirie lunară" value={plan.monthlyRent} onChange={(value) => update("monthlyRent", value)} /><NumberField label="Garanție" value={plan.depositMonths} suffix="luni de chirie" onChange={(value) => update("depositMonths", value)} /></> : <><NumberField label="Preț de cumpărare / avans modelat" value={plan.purchasePrice} suffix="RON investiție inițială" onChange={(value) => update("purchasePrice", value)} /><NumberField label="Rată lunară finanțare" value={plan.monthlyPropertyLoan} onChange={(value) => update("monthlyPropertyLoan", value)} /></>}
            <NumberField label="Amenajare / adaptare" value={plan.fitoutCost} suffix="RON inițial" onChange={(value) => update("fitoutCost", value)} />
          </div>
        </div>
        <div className="business-input-group">
          <h4>Echipamente, stoc și capital de lucru</h4>
          <div className="business-fields-grid"><NumberField label="Utilaje de croitorie" value={plan.equipmentInvestment} suffix="RON inițial" onChange={(value) => update("equipmentInvestment", value)} /><NumberField label="Unelte și mobilier tehnic" value={plan.toolsInvestment} suffix="RON inițial" onChange={(value) => update("toolsInvestment", value)} /><NumberField label="Stoc inițial de materiale" value={plan.openingMaterials} suffix="RON inițial" onChange={(value) => update("openingMaterials", value)} /><NumberField label="Înființare / servicii profesionale" value={plan.setupProfessionals} suffix="RON inițial" onChange={(value) => update("setupProfessionals", value)} /><NumberField label="Rezervă de numerar la deschidere" value={plan.openingCashReserve} suffix="RON inițial" onChange={(value) => update("openingCashReserve", value)} /></div>
        </div>
        <div className="business-input-group">
          <h4>Echipă și capacitate</h4>
          <div className="business-fields-grid"><NumberField label="Roluri plătite (fondator inclus dacă este plătit)" value={plan.paidRoles} suffix="persoane / roluri" onChange={(value) => update("paidRoles", value)} /><NumberField label="Cost lunar total per rol" value={plan.loadedCostPerRole} onChange={(value) => update("loadedCostPerRole", value)} /><NumberField label="Ore productive per rol" value={plan.productiveHoursPerRole} suffix="ore / lună" onChange={(value) => update("productiveHoursPerRole", value)} /></div>
          <div className="capacity-meter"><span>Ore necesare cererii introduse</span><strong>{money(result.demandHours)} h</strong><span>Capacitatea modelată</span><strong>{money(result.availableHours)} h</strong><div><i style={{ width: `${Math.min(100, result.demandHours > 0 ? result.demandHours / Math.max(1, result.availableHours) * 100 : 0)}%` }} /></div><small>Orele productive sunt o ipoteză de planificare, nu un program de lucru măsurat.</small></div>
        </div>
        <div className="business-input-group">
          <h4>Utilități lunare</h4>
          <div className="business-fields-grid"><NumberField label="Electricitate" value={plan.electricity} onChange={(value) => update("electricity", value)} /><NumberField label="Apă și canalizare" value={plan.water} onChange={(value) => update("water", value)} /><NumberField label="Încălzire" value={plan.heating} onChange={(value) => update("heating", value)} /><NumberField label="Internet / telefonie" value={plan.internet} onChange={(value) => update("internet", value)} /></div>
        </div>
        <div className="business-input-group">
          <h4>Alte costuri lunare</h4>
          <div className="business-fields-grid"><NumberField label="Mentenanță utilaje" value={plan.maintenance} onChange={(value) => update("maintenance", value)} /><NumberField label="Asigurări" value={plan.insurance} onChange={(value) => update("insurance", value)} /><NumberField label="Contabilitate" value={plan.accounting} onChange={(value) => update("accounting", value)} /><NumberField label="Promovare" value={plan.marketing} onChange={(value) => update("marketing", value)} /><NumberField label="Livrare / logistică" value={plan.logistics} onChange={(value) => update("logistics", value)} /><NumberField label="Alte costuri" value={plan.otherMonthly} onChange={(value) => update("otherMonthly", value)} /></div>
        </div>
      </section>

      <section className="os-panel business-market-panel">
        <div className="panel-title"><span>PREȚURI ȘI CERERE</span><h3>Ce poți vinde, la ce preț și în ce volum</h3></div>
        <p className="business-panel-copy">Pentru fiecare produs compară un preț public local cu prețul de vânzare planificat. Introdu volumul lunar realist, costul direct al materialelor și orele de lucru. Adaugă sursa și data comparației; niciun preț din demo nu este verificat.</p>
        <label className="business-export-share">Vânzări planificate către clienți din afara țării<input type="number" min="0" max="100" value={plan.exportSalesPct} onChange={(event) => update("exportSalesPct", Math.max(0, Math.min(100, numeric(event.target.value))))} /><small>procent din venit · editabil · fără comenzi sau cumpărători conectați</small></label>
        <div className="business-product-list">{result.rows.map((item) => <article className="business-product-card" key={item.id}>
          <div className="business-product-title"><strong>{item.product}</strong><span>{money(item.feasibleUnits)} unități fezabile / lună</span></div>
          <div className="business-product-fields">
            <label>Preț public comparabil<input type="number" min="0" value={item.marketPrice} onChange={(event) => updateProduct(item.id, "marketPrice", numeric(event.target.value))} /><small>RON / unitate</small></label>
            <label>Prețul tău planificat<input type="number" min="0" value={item.plannedPrice} onChange={(event) => updateProduct(item.id, "plannedPrice", numeric(event.target.value))} /><small>RON / unitate</small></label>
            <label>Cerere estimată<input type="number" min="0" value={item.unitsPerMonth} onChange={(event) => updateProduct(item.id, "unitsPerMonth", numeric(event.target.value))} /><small>unități / lună</small></label>
            <label>Materiale directe<input type="number" min="0" value={item.materialsPerUnit} onChange={(event) => updateProduct(item.id, "materialsPerUnit", numeric(event.target.value))} /><small>RON / unitate</small></label>
            <label>Manoperă directă<input type="number" min="0" value={item.hoursPerUnit} onChange={(event) => updateProduct(item.id, "hoursPerUnit", numeric(event.target.value))} /><small>ore / unitate</small></label>
            <label>Pondere materiale locale<input type="number" min="0" max="100" value={item.localMaterialSharePct} onChange={(event) => updateProduct(item.id, "localMaterialSharePct", Math.max(0, Math.min(100, numeric(event.target.value))))} /><small>procent estimat, de confirmat</small></label>
          </div>
          <div className="business-market-line"><label>Sursa comparației<input value={item.comparisonSource} onChange={(event) => updateProduct(item.id, "comparisonSource", event.target.value)} /></label><span>Diferență față de reper: {item.plannedPrice - item.marketPrice >= 0 ? "+" : ""}{money(item.plannedPrice - item.marketPrice)} RON</span></div>
          <label className="business-origin-field">Furnizor și origine pentru materiale<input value={item.materialOrigin} onChange={(event) => updateProduct(item.id, "materialOrigin", event.target.value)} /></label>
          <div className="business-product-result"><span>Venit fezabil {money(item.revenue)} RON</span><span>Materiale {money(item.materials)} RON</span><strong>Marjă de contribuție {money(item.contribution)} RON</strong></div>
        </article>)}</div>
        <div className="business-circularity-strip" aria-label="Fluxuri lunare estimate în și din economie">
          <article><span>Materiale din surse locale estimate</span><strong>{money(result.localMaterials)} RON</strong><small>din {money(result.materials)} RON costuri directe · după ponderile introduse</small></article>
          <article><span>Materiale importate sau origine necunoscută</span><strong>{money(result.externalOrUnknownMaterials)} RON</strong><small>separă importurile confirmate de originile încă necunoscute</small></article>
          <article><span>Vânzări către piața internă</span><strong>{money(result.domesticSales)} RON</strong><small>venit lunar estimat, înainte de taxe</small></article>
          <article><span>Încasări planificate din export</span><strong>{money(result.exportSales)} RON</strong><small>ipoteză de vânzare externă, nu contract sau valută efectivă</small></article>
        </div>
        <div className="business-growth-notes"><h4>Scenarii de sustenabilitate</h4>{scenarios.map((scenario) => <div className="business-scenario-row" key={scenario.name}><span>{scenario.name}</span><strong className={scenario.result.operatingResult < 0 ? "loss-text" : "gain-text"}>{scenario.result.operatingResult < 0 ? "−" : "+"}{money(Math.abs(scenario.result.operatingResult))} RON / lună</strong><small>venit {money(scenario.result.revenue)} · cerere și costuri variate</small></div>)}</div>
      </section>
    </div>

    <section className="business-approval-section">
      <div className="business-approval-header"><div><p className="balance-eyebrow">PARCURS ADMINISTRATIV · DE VERIFICAT LOCAL</p><h2>Ce documente și confirmări pot fi necesare</h2><p>Marchează fiecare punct după ce verifici cerința cu emitentul. „Înregistrat” în plan înseamnă doar că ai introdus propriul status și referință; nu verificăm documentul și nu acordăm aprobări.</p></div><span className="approval-progress">{doneApprovals} / {approvalSpecs.length} consemnate sau N/A</span></div>
      <div className="approval-checklist">{approvalSpecs.map((spec) => {
        const record = plan.approvals.find((item) => item.id === spec.id) ?? { id: spec.id, status: "VERIFY" as const, reference: "", sourceUrl: spec.sourceUrl ?? "" };
        return <article className="approval-item" key={spec.id}>
          <div className="approval-item-title"><span>{spec.authority}</span><h3>{spec.title}</h3></div>
          <p>{spec.condition}</p><div className="approval-prepare"><strong>Pregătește / verifică:</strong> {spec.prepare}</div>
          <details className="approval-document-list"><summary>Documente și întrebări de confirmat · {record.documentsDone?.length ?? 0} / {spec.documents.length} bifate</summary><p>Listă de pregătire, nu listă oficială de cerințe. Confirmă fiecare element cu autoritatea pentru forma juridică, spațiul și activitatea ta.</p><div>{spec.documents.map((document, index) => {
            const documentId = `${spec.id}-${index}`;
            return <label key={documentId}><input type="checkbox" checked={(record.documentsDone ?? []).includes(documentId)} onChange={() => toggleApprovalDocument(spec.id, documentId)} /><span>{document}</span></label>;
          })}</div></details>
          <div className="approval-item-actions"><label>Status<select value={record.status} onChange={(event) => updateApproval(spec.id, "status", event.target.value as ApprovalStatus)}><option value="VERIFY">De verificat</option><option value="IN_PROGRESS">Discuție / depunere în curs</option><option value="RECORDED">Consemnat ca obținut</option><option value="NOT_APPLICABLE">Verificat · nu se aplică</option></select></label><label>Referință, număr dosar sau răspuns<input value={record.reference} onChange={(event) => updateApproval(spec.id, "reference", event.target.value)} placeholder="Nu încărca documente personale aici" /></label>
            <label className="approval-source-input">Linkul autorității<input value={record.sourceUrl} onChange={(event) => updateApproval(spec.id, "sourceUrl", event.target.value)} placeholder="Sursa oficială pentru localitatea ta" /></label>
            {record.sourceUrl ? <a className="text-button approval-source-link" href={record.sourceUrl} target="_blank" rel="noreferrer">{spec.sourceLabel} ↗</a> : <span className="approval-source-missing">Sursă locală de adăugat</span>}
          </div>
        </article>;
      })}</div>
      <div className="business-approval-sources"><strong>Surse naționale pentru verificare:</strong><a href="https://caen.onrc.ro/" target="_blank" rel="noreferrer">nomenclator CAEN al ONRC</a><a href="https://reges.inspectiamuncii.ro/informatii-utile/codul-muncii/?faqid=8035" target="_blank" rel="noreferrer">REGES-ONLINE / Codul muncii</a><a href="https://pcuel.oli.gov.ro/ro/" target="_blank" rel="noreferrer">PCUEL · licențiere industrială</a><a href="https://isuvn.igsu.ro/avizare-autorizare/informare-376" target="_blank" rel="noreferrer">IGSU · securitate la incendiu</a></div>
    </section>

    <p className="business-privacy-note">Ipotezele, referințele și statusurile de aprobare se salvează local în browser. Nu le trimitem către instituții sau PolisOS. Modelul nu substituie un contabil, proiectant, consilier juridic ori răspunsul autorității competente.</p>
  </main>;
}

function BusinessKpi({ label, value, detail, tone = "" }: { label: string; value: number; detail: string; tone?: string }) {
  return <article className={`business-kpi ${tone}`}><span>{label}</span><strong>{money(value)} RON</strong><small>{detail}</small></article>;
}
