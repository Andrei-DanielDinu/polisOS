import { useEffect, useMemo, useState } from "react";

type ExpenseCategory = "Locuință" | "Utilități" | "Alimente" | "Mobilitate" | "Sănătate" | "Îngrijire și educație" | "Obiceiuri" | "Altele";
type ExpenseLine = {
  id: string;
  label: string;
  category: ExpenseCategory;
  unit: string;
  price: number;
  quantity: number;
  perPerson: boolean;
  domesticShare: number;
  destination: string;
  animalOrigin?: boolean;
  habit?: "alcohol" | "smoking";
};

interface CitizenModel {
  income: number;
  incomeSource: string;
  incomeDomesticShare: number;
  publicCashBenefits: number;
  taxes: number;
  householdMembers: number;
  vegan: boolean;
  alcohol: boolean;
  smoking: boolean;
  paidDaysOff: number;
  environmentRating: number;
  careHoursPerWeek: number;
  serviceEstimates: Record<string, number>;
  expenses: ExpenseLine[];
}

const storageKey = "polisos.citizen-balance.v1";

function defaultExpenses(): ExpenseLine[] {
  return [
    { id: "rent", label: "Chirie / locuință", category: "Locuință", unit: "gospodărie / lună", price: 2100, quantity: 1, perPerson: false, domesticShare: 95, destination: "Proprietar / furnizor de locuință" },
    { id: "electricity", label: "Electricitate", category: "Utilități", unit: "kWh", price: 1.15, quantity: 90, perPerson: true, domesticShare: 65, destination: "Furnizor de electricitate; mixul de origine trebuie verificat" },
    { id: "water", label: "Apă și canalizare", category: "Utilități", unit: "m³", price: 9, quantity: 2, perPerson: true, domesticShare: 100, destination: "Operator local de apă" },
    { id: "waste", label: "Colectarea deșeurilor", category: "Utilități", unit: "gospodărie / lună", price: 28, quantity: 1, perPerson: false, domesticShare: 100, destination: "Serviciu local de salubritate" },
    { id: "internet", label: "Internet și telefonie mobilă", category: "Utilități", unit: "persoană / lună", price: 48, quantity: 1, perPerson: true, domesticShare: 70, destination: "Furnizor telecom; editează originea" },
    { id: "bread", label: "Pâine", category: "Alimente", unit: "pâine", price: 4.5, quantity: 12, perPerson: true, domesticShare: 80, destination: "Brutărie / comerciant" },
    { id: "potatoes", label: "Cartofi", category: "Alimente", unit: "kg", price: 4.2, quantity: 4, perPerson: true, domesticShare: 75, destination: "Fermă / comerciant" },
    { id: "tomatoes", label: "Roșii", category: "Alimente", unit: "kg", price: 12, quantity: 2, perPerson: true, domesticShare: 65, destination: "Producător / comerciant" },
    { id: "cabbage", label: "Varză", category: "Alimente", unit: "kg", price: 4, quantity: 1, perPerson: true, domesticShare: 80, destination: "Producător / comerciant" },
    { id: "carrots", label: "Morcovi", category: "Alimente", unit: "kg", price: 5, quantity: 1, perPerson: true, domesticShare: 80, destination: "Producător / comerciant" },
    { id: "other-vegetables", label: "Alte legume", category: "Alimente", unit: "kg", price: 11, quantity: 3, perPerson: true, domesticShare: 70, destination: "Producător / comerciant" },
    { id: "legumes", label: "Fasole, linte și alte leguminoase", category: "Alimente", unit: "kg", price: 12, quantity: 2, perPerson: true, domesticShare: 45, destination: "Producător / procesator / comerciant" },
    { id: "fruit", label: "Fructe", category: "Alimente", unit: "kg", price: 10, quantity: 4, perPerson: true, domesticShare: 60, destination: "Producător / comerciant" },
    { id: "pork", label: "Carne de porc", category: "Alimente", unit: "kg", price: 25, quantity: 2, perPerson: true, domesticShare: 70, destination: "Fermă / procesator / comerciant", animalOrigin: true },
    { id: "beef", label: "Carne de vită", category: "Alimente", unit: "kg", price: 42, quantity: 1, perPerson: true, domesticShare: 55, destination: "Fermă / procesator / comerciant", animalOrigin: true },
    { id: "fish", label: "Pește", category: "Alimente", unit: "kg", price: 34, quantity: 1, perPerson: true, domesticShare: 30, destination: "Pescar / importator / comerciant", animalOrigin: true },
    { id: "dairy-eggs", label: "Lactate și ouă", category: "Alimente", unit: "echivalent kg", price: 18, quantity: 4, perPerson: true, domesticShare: 75, destination: "Fermă / procesator / comerciant", animalOrigin: true },
    { id: "transit", label: "Transport public", category: "Mobilitate", unit: "călătorie", price: 3.5, quantity: 40, perPerson: true, domesticShare: 100, destination: "Operator de transport public" },
    { id: "fuel", label: "Carburant", category: "Mobilitate", unit: "gospodărie / lună", price: 260, quantity: 1, perPerson: false, domesticShare: 45, destination: "Comerciant de combustibil; mixul de origine trebuie verificat" },
    { id: "ride-sharing", label: "Taxi / transport la comandă", category: "Mobilitate", unit: "cursă", price: 25, quantity: 4, perPerson: true, domesticShare: 75, destination: "Șofer / platformă de mobilitate" },
    { id: "health", label: "Cheltuieli directe pentru sănătate", category: "Sănătate", unit: "persoană / lună", price: 90, quantity: 1, perPerson: true, domesticShare: 85, destination: "Farmacie / furnizor de servicii medicale" },
    { id: "care", label: "Îngrijire copii / educație", category: "Îngrijire și educație", unit: "gospodărie / lună", price: 0, quantity: 1, perPerson: false, domesticShare: 100, destination: "Furnizor de îngrijire sau educație" },
    { id: "clothing", label: "Îmbrăcăminte și încălțăminte", category: "Altele", unit: "persoană / lună", price: 120, quantity: 1, perPerson: true, domesticShare: 35, destination: "Comerciant; originea producției trebuie verificată" },
    { id: "other", label: "Alte bunuri pentru gospodărie", category: "Altele", unit: "gospodărie / lună", price: 250, quantity: 1, perPerson: false, domesticShare: 50, destination: "Editează furnizorul / destinația" },
    { id: "alcohol", label: "Alcool", category: "Obiceiuri", unit: "produs", price: 12, quantity: 8, perPerson: true, domesticShare: 70, destination: "Producător / comerciant", habit: "alcohol" },
    { id: "smoking", label: "Fumat", category: "Obiceiuri", unit: "pachet", price: 25, quantity: 10, perPerson: true, domesticShare: 55, destination: "Producător / comerciant", habit: "smoking" }
  ];
}

function makeDefaults(): CitizenModel {
  return {
    income: 5500,
    incomeSource: "Venit brut din muncă · exemplu",
    incomeDomesticShare: 100,
    publicCashBenefits: 0,
    taxes: 1050,
    householdMembers: 1,
    vegan: false,
    alcohol: false,
    smoking: false,
    paidDaysOff: 25,
    environmentRating: 3,
    careHoursPerWeek: 8,
    serviceEstimates: { healthcare: 0, education: 0, mobility: 0, utilities: 0, culture: 0 },
    expenses: defaultExpenses()
  };
}

function readModel(): CitizenModel {
  try {
    const serialized = localStorage.getItem(storageKey);
    if (!serialized) return makeDefaults();
    const saved = JSON.parse(serialized) as Partial<CitizenModel>;
    const defaults = makeDefaults();
    const defaultExpenseIds = new Set(defaults.expenses.map((item) => item.id));
    const savedExpenses = Array.isArray(saved.expenses) ? saved.expenses : [];
    return {
      income: saved.income ?? defaults.income,
      incomeSource: saved.incomeSource ?? defaults.incomeSource,
      incomeDomesticShare: saved.incomeDomesticShare ?? defaults.incomeDomesticShare,
      publicCashBenefits: saved.publicCashBenefits ?? defaults.publicCashBenefits,
      taxes: saved.taxes ?? defaults.taxes,
      householdMembers: saved.householdMembers ?? defaults.householdMembers,
      vegan: saved.vegan ?? defaults.vegan,
      alcohol: saved.alcohol ?? defaults.alcohol,
      smoking: saved.smoking ?? defaults.smoking,
      paidDaysOff: saved.paidDaysOff ?? defaults.paidDaysOff,
      environmentRating: saved.environmentRating ?? defaults.environmentRating,
      careHoursPerWeek: saved.careHoursPerWeek ?? defaults.careHoursPerWeek,
      serviceEstimates: { ...defaults.serviceEstimates, ...saved.serviceEstimates },
      expenses: defaults.expenses.map((item) => savedExpenses.find((savedItem) => savedItem.id === item.id) ?? item)
        .concat(savedExpenses.filter((item) => !defaultExpenseIds.has(item.id)))
    };
  } catch {
    return makeDefaults();
  }
}

function amount(value: number) {
  return new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 2 }).format(value);
}

function nonnegative(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function CitizenBalance() {
  const [model, setModel] = useState<CitizenModel>(readModel);
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(model)); } catch { /* page remains interactive without persistence */ }
  }, [model]);

  const visibleExpenses = useMemo(() => model.expenses.filter((line) => {
    if (model.vegan && line.animalOrigin) return false;
    if (line.habit === "alcohol" && !model.alcohol) return false;
    if (line.habit === "smoking" && !model.smoking) return false;
    return true;
  }), [model.expenses, model.vegan, model.alcohol, model.smoking]);

  const totals = useMemo(() => {
    const items = visibleExpenses.map((line) => ({
      ...line,
      householdQuantity: line.quantity * (line.perPerson ? model.householdMembers : 1),
      total: line.price * line.quantity * (line.perPerson ? model.householdMembers : 1)
    }));
    const expenses = items.reduce((sum, line) => sum + line.total, 0);
    const domesticSpending = items.reduce((sum, line) => sum + line.total * line.domesticShare / 100, 0);
    const externalOutflow = expenses - domesticSpending;
    const cashIn = model.income + model.publicCashBenefits;
    const cashOut = expenses + model.taxes;
    const socialServiceEstimate = Object.values(model.serviceEstimates).reduce((sum, value) => sum + value, 0);
    return { items, expenses, domesticSpending, externalOutflow, cashIn, cashOut, available: cashIn - cashOut, socialServiceEstimate };
  }, [visibleExpenses, model.householdMembers, model.income, model.publicCashBenefits, model.taxes, model.serviceEstimates]);

  const updateModel = <K extends keyof CitizenModel>(key: K, value: CitizenModel[K]) => setModel((current) => ({ ...current, [key]: value }));
  const updateExpense = <K extends keyof ExpenseLine>(id: string, key: K, value: ExpenseLine[K]) => setModel((current) => ({
    ...current,
    expenses: current.expenses.map((line) => line.id === id ? { ...line, [key]: value } : line)
  }));
  const updateServiceEstimate = (key: string, value: string) => setModel((current) => ({
    ...current,
    serviceEstimates: { ...current.serviceEstimates, [key]: nonnegative(value) }
  }));

  const reset = () => {
    setModel(makeDefaults());
    setResetMessage("Valorile ilustrative au fost restabilite.");
  };

  const inbound = [
    { id: "earned", label: "Venit", detail: `${model.incomeDomesticShare}% sursă internă · ${model.incomeSource || "sursă nespecificată"}`, value: model.income, kind: "cash" as const, color: "#497c5e" },
    { id: "benefits", label: "Beneficii în bani", detail: "Estimare proprie · transfer public", value: model.publicCashBenefits, kind: "cash" as const, color: "#648f70" },
    { id: "services", label: "Servicii publice", detail: "Estimare opțională a valorii de înlocuire", value: totals.socialServiceEstimate, kind: "estimate" as const, color: "#64889a" },
    { id: "time-off", label: "Zile libere", detail: `${model.paidDaysOff} zile/an · completat de utilizator`, value: model.paidDaysOff, kind: "days" as const, color: "#7085ad" },
    { id: "environment", label: "Mediu curat", detail: `${model.environmentRating} / 5 · autoevaluare`, value: model.environmentRating, kind: "rating" as const, color: "#5f9c95" },
    { id: "rights", label: "Drepturi și protecții", detail: "Universale · fără preț", value: 0, kind: "rights" as const, color: "#8d79a7" }
  ];
  const outbound = [
    { id: "tax", label: "Impozite / contribuții", detail: "Estimare lunară manuală → buget public", value: model.taxes, color: "#c37851" },
    { id: "domestic", label: "Produse / servicii interne", detail: "Pondere estimată din cheltuielile gospodăriei", value: totals.domesticSpending, color: "#6f8f4f" },
    { id: "external", label: "Cheltuieli externe / importuri", detail: "Pondere estimată în afara producției interne", value: totals.externalOutflow, color: "#bd7566" },
    { id: "obligations", label: "Îngrijire / comunitate", detail: `${model.careHoursPerWeek} ore/săptămână · completat de utilizator`, value: model.careHoursPerWeek, color: "#818b9f", noncash: true }
  ];

  const maxFlow = Math.max(1, ...inbound.map((item) => item.value), ...outbound.map((item) => item.value));

  return <main className="citizen-balance-page">
    <section className="balance-heading">
      <div><p className="balance-eyebrow">POLISOS · MODEL PERSONAL AL GOSPODĂRIEI</p><h1>Economia cetățeanului</h1><p>Urmărește cum circulă bugetul gospodăriei între venituri, servicii publice, producători interni și furnizori externi.</p></div>
      <div className="balance-mode"><span>LOCAL</span><strong>Model personal</strong><small>Salvat doar în acest browser</small></div>
    </section>
    <div className="balance-caution"><strong>Model personal ilustrativ.</strong> Prețurile, venitul, taxele și estimările serviciilor sunt exemple, nu tarife actuale din România, calcule fiscale, drepturi la beneficii sau statistici economice. Editează-le după propriile ipoteze. Datele nu sunt transmise către serviciile PolisOS.</div>

    <div className="balance-actions"><div><strong>Nu se calculează un scor al cetățeanului.</strong><span>Drepturile, mediul curat și serviciile publice sunt separate de bani; statutul unei persoane nu depinde de contribuția fiscală.</span></div><button className="button button-outline button-small" onClick={reset}>Resetează valorile exemplu</button></div>
    {resetMessage && <div className="balance-reset-message" role="status">Valorile ilustrative au fost restabilite.</div>}

    <section className="balance-kpis" aria-label="Rezumat lunar al gospodăriei">
      <BalanceKpi label="Intrări lunare în bani" value={amount(totals.cashIn)} detail="Venit brut + beneficii introduse" />
      <BalanceKpi label="Cheltuieli lunare" value={amount(totals.expenses)} detail={`${model.householdMembers} ${model.householdMembers === 1 ? "membru" : "membri"} în gospodărie`} />
      <BalanceKpi label="Impozite și contribuții" value={amount(model.taxes)} detail="Introduse manual · fără formulă fiscală" />
      <BalanceKpi label="Sold rămas" value={amount(totals.available)} detail="Intrări − cheltuieli − impozite introduse" tone={totals.available < 0 ? "negative" : ""} />
    </section>

    <section className="balance-canvas-section">
      <div className="balance-section-heading"><div><p className="balance-eyebrow">CANVAS AL FLUXURILOR · VEDERE LUNARĂ</p><h2>Societatea și cetățeanul</h2><p>Liniile continue arată bani. Liniile întrerupte arată servicii, timp, mediu sau drepturi; acestea nu intră în soldul în bani.</p></div><span className="balance-units">RON / lună · dacă nu este indicată altă unitate</span></div>
      <div className="balance-canvas-wrap">
        <svg className="balance-svg" viewBox="0 0 1160 530" role="img" aria-label="Fluxuri dintre societate, cetățean și destinațiile cheltuielilor">
          <defs>
            <marker id="balance-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#75827a" /></marker>
          </defs>
          <text x="24" y="24" className="svg-column-title">INTRĂ ÎN GOSPODĂRIE</text>
          <text x="880" y="24" className="svg-column-title">IES DIN GOSPODĂRIE</text>
          {inbound.map((item, index) => {
            const y = 43 + index * 76;
            const monetary = item.kind === "cash";
            const width = item.kind === "cash" || item.kind === "estimate" ? Math.min(14, 2 + 12 * Math.sqrt(item.value / maxFlow)) : 3;
            const dashed = !monetary;
            return <g key={item.id}>
              <path d={`M 265 ${y + 30} C 335 ${y + 30}, 365 230, 423 245`} fill="none" stroke={item.color} strokeWidth={width} strokeDasharray={dashed ? "7 6" : undefined} markerEnd="url(#balance-arrow)" opacity=".82" />
              <rect x="18" y={y} width="247" height="58" rx="9" className="svg-flow-card" />
              <circle cx="39" cy={y + 20} r="5" fill={item.color} />
              <text x="53" y={y + 23} className="svg-flow-label">{item.label}</text>
              <text x="32" y={y + 45} className="svg-flow-detail">{item.detail.length > 36 ? `${item.detail.slice(0, 34)}…` : item.detail}</text>
              <text x="250" y={y + 21} textAnchor="end" className="svg-flow-value">{item.kind === "cash" || item.kind === "estimate" ? `${amount(item.value)} RON` : item.kind === "days" ? `${item.value} d` : item.kind === "rating" ? `${item.value}/5` : "Universal"}</text>
            </g>;
          })}
          <circle cx="540" cy="265" r="94" className="svg-citizen-halo" />
          <circle cx="540" cy="232" r="19" className="svg-person-head" />
          <path d="M 500 302 C 501 272 513 259 540 259 C 567 259 579 272 580 302 C 557 322 523 322 500 302 Z" className="svg-person-body" />
          <text x="540" y="337" textAnchor="middle" className="svg-citizen-title">CETĂȚEAN / GOSPODĂRIE</text>
          <text x="540" y="357" textAnchor="middle" className="svg-citizen-detail">{model.householdMembers} {model.householdMembers === 1 ? "membru" : "membri"} · intrări: {amount(totals.cashIn)} RON</text>
          <text x="540" y="378" textAnchor="middle" className="svg-citizen-detail">sold rămas: {amount(totals.available)} RON / lună</text>
          {outbound.map((item, index) => {
            const y = 84 + index * 105;
            const width = item.noncash ? 3 : Math.min(16, 2 + 13 * Math.sqrt(item.value / maxFlow));
            return <g key={item.id}>
              <path d={`M 628 265 C 720 265, 740 ${y + 29}, 865 ${y + 29}`} fill="none" stroke={item.color} strokeWidth={width} strokeDasharray={item.noncash ? "7 6" : undefined} markerEnd="url(#balance-arrow)" opacity=".82" />
              <rect x="865" y={y} width="275" height="61" rx="9" className="svg-flow-card" />
              <circle cx="886" cy={y + 20} r="5" fill={item.color} />
              <text x="900" y={y + 23} className="svg-flow-label">{item.label}</text>
              <text x="881" y={y + 46} className="svg-flow-detail">{item.detail.length > 40 ? `${item.detail.slice(0, 38)}…` : item.detail}</text>
              <text x="1125" y={y + 22} textAnchor="end" className="svg-flow-value">{item.noncash ? `${item.value} h/săpt.` : `${amount(item.value)} RON`}</text>
            </g>;
          })}
          <text x="540" y="500" textAnchor="middle" className="svg-flow-footnote">Ponderea internă sau externă este o estimare editabilă; originea produsului poate fi mixtă ori necunoscută.</text>
        </svg>
      </div>
      <div className="balance-legend"><span><i className="legend-solid" /> Bani</span><span><i className="legend-dashed" /> Beneficii / obligații fără plată</span><span>Drepturile și mediul nu se convertesc într-un scor financiar.</span></div>
    </section>

    <div className="balance-two-column">
      <section className="balance-panel">
        <div className="balance-panel-head"><div><p className="balance-eyebrow">DATELE GOSPODĂRIEI</p><h2>Setează ipotezele</h2></div><span className="balance-demo-chip">EDITABIL</span></div>
        <div className="balance-controls-grid">
          <label>Venit brut lunar al gospodăriei <span>RON înainte de impozitele și contribuțiile introduse</span><input type="number" min="0" step="any" value={model.income} onChange={(event) => updateModel("income", nonnegative(event.target.value))} /></label>
          <label>Sursa venitului <span>Angajator / sector / descriere</span><input type="text" value={model.incomeSource} onChange={(event) => updateModel("incomeSource", event.target.value)} /></label>
          <label>Beneficii în bani pe lună <span>Estimare pentru gospodărie · nu verifică eligibilitatea</span><input type="number" min="0" step="any" value={model.publicCashBenefits} onChange={(event) => updateModel("publicCashBenefits", nonnegative(event.target.value))} /></label>
          <label>Impozite și contribuții publice <span>Sumă manuală · fără calcul bazat pe lege</span><input type="number" min="0" step="any" value={model.taxes} onChange={(event) => updateModel("taxes", nonnegative(event.target.value))} /></label>
          <label>Numărul membrilor gospodăriei <span>Scalează cantitățile per persoană de mai jos</span><input type="number" min="1" max="20" step="1" value={model.householdMembers} onChange={(event) => updateModel("householdMembers", Math.max(1, Math.min(20, Math.floor(nonnegative(event.target.value) || 1))))} /></label>
          <label>Zile libere plătite <span>Zile pe an · estimarea ta</span><input type="number" min="0" max="365" step="1" value={model.paidDaysOff} onChange={(event) => updateModel("paidDaysOff", Math.max(0, Math.min(365, Math.floor(nonnegative(event.target.value)))))} /></label>
          <label>Timp pentru îngrijire / comunitate <span>Timp neremunerat · ore pe săptămână</span><input type="number" min="0" step="any" value={model.careHoursPerWeek} onChange={(event) => updateModel("careHoursPerWeek", nonnegative(event.target.value))} /></label>
          <label>Calitatea mediului <span>Evaluarea ta · nu este monitorizare oficială</span><select value={model.environmentRating} onChange={(event) => updateModel("environmentRating", Number(event.target.value))}>{[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label>
        </div>
        <label className="income-origin-control">Ponderea venitului din surse interne <strong>{model.incomeDomesticShare}%</strong><input type="range" min="0" max="100" value={model.incomeDomesticShare} onChange={(event) => updateModel("incomeDomesticShare", Number(event.target.value))} /><small>{model.incomeDomesticShare}% intern · {100 - model.incomeDomesticShare}% extern / necunoscut</small></label>
        <div className="balance-toggle-grid">
          <label className="balance-toggle"><input type="checkbox" checked={model.vegan} onChange={(event) => updateModel("vegan", event.target.checked)} /><span><strong>Alimentație exclusiv vegetală (vegană)</strong><small>Elimină din model carnea, peștele, lactatele și ouăle</small></span></label>
          <label className="balance-toggle"><input type="checkbox" checked={model.alcohol} onChange={(event) => updateModel("alcohol", event.target.checked)} /><span><strong>Include cheltuieli pentru alcool</strong><small>Adaugă mai jos categoria editabilă pentru alcool</small></span></label>
          <label className="balance-toggle"><input type="checkbox" checked={model.smoking} onChange={(event) => updateModel("smoking", event.target.checked)} /><span><strong>Include cheltuieli pentru fumat</strong><small>Adaugă mai jos categoria editabilă pentru tutun</small></span></label>
        </div>
      </section>

      <section className="balance-panel society-panel">
        <div className="balance-panel-head"><div><p className="balance-eyebrow">BENEFICII FĂRĂ PLATĂ DIRECTĂ</p><h2>Ce oferă societatea</h2></div><span className="balance-demo-chip">ESTIMAREA TA</span></div>
        <p className="balance-panel-copy">Estimare opțională a valorii de înlocuire a serviciilor folosite de gospodărie. Este o comparație personală, nu costul guvernului, valoarea unui drept sau o sumă scăzută din impozite.</p>
        <div className="service-estimate-list">{[
          ["healthcare", "Acces la servicii medicale"], ["education", "Educație și îngrijire"], ["mobility", "Transport public și infrastructură"], ["utilities", "Apă, canalizare și salubritate publice"], ["culture", "Biblioteci, parcuri și cultură"]
        ].map(([key, label]) => <label key={key}>{label}<div><input type="number" min="0" step="any" value={model.serviceEstimates[key] ?? 0} onChange={(event) => updateServiceEstimate(key, event.target.value)} /><span>RON / lună</span></div></label>)}</div>
        <div className="service-estimate-total"><span>Estimare personală totală</span><strong>{amount(totals.socialServiceEstimate)} RON / lună</strong></div>
        <div className="rights-note"><span>§</span><div><strong>Drepturile nu sunt o poziție contabilă.</strong><p>Protecția juridică, tratamentul egal și drepturile civice sunt universale. Modelul nu le atribuie un preț și nu le condiționează de venit, impozite sau loc de muncă.</p></div></div>
        <div className="rights-note environment-note"><span>◌</span><div><strong>Mediul este prezentat ca un context.</strong><p>Evaluarea ta de la 1 la 5 nu reprezintă un indicator măsurat al calității aerului, apei sau biodiversității.</p></div></div>
      </section>
    </div>

    <section className="balance-panel expense-panel">
      <div className="balance-panel-head"><div><p className="balance-eyebrow">CHELTUIELILE GOSPODĂRIEI</p><h2>Modifică prețuri, cantități și destinații</h2><p className="balance-panel-copy">Pentru fiecare poziție, editează prețul unitar și cantitatea lunară. Cantitățile per persoană se scalează după numărul membrilor. Ponderea internă estimează cât rămâne în economia locală; câmpul destinație descrie furnizorul sau producătorul presupus.</p></div><span className="balance-demo-chip">{visibleExpenses.length} POZIȚII</span></div>
      <div className="expense-table-wrap"><table className="expense-table"><thead><tr><th>Produs / serviciu</th><th>Preț unitar</th><th>Cantitate / lună</th><th>Scalare</th><th>Total estimat</th><th>Pondere internă</th><th>Furnizor / destinație</th></tr></thead><tbody>
        {totals.items.map((line) => <tr key={line.id}>
          <td><strong>{line.label}</strong><small>{line.category} · {line.unit}</small></td>
          <td><label className="table-number"><span>RON</span><input aria-label={`${line.label}: preț unitar`} type="number" min="0" step="any" value={line.price} onChange={(event) => updateExpense(line.id, "price", nonnegative(event.target.value))} /></label></td>
          <td><input className="quantity-input" aria-label={`${line.label}: cantitate lunară`} type="number" min="0" step="any" value={line.quantity} onChange={(event) => updateExpense(line.id, "quantity", nonnegative(event.target.value))} /><small>{line.householdQuantity.toFixed(line.householdQuantity % 1 ? 1 : 0)} {line.unit.split(" /")[0]} în total</small></td>
          <td><span className="scale-pill">{line.perPerson ? "Per persoană" : "Gospodărie"}</span></td>
          <td><strong>{amount(line.total)} RON</strong></td>
          <td><label className="share-control"><input aria-label={`${line.label}: pondere internă procentuală`} type="range" min="0" max="100" value={line.domesticShare} onChange={(event) => updateExpense(line.id, "domesticShare", Number(event.target.value))} /><span>{line.domesticShare}% intern</span><small>{100 - line.domesticShare}% extern / necunoscut</small></label></td>
          <td><input className="destination-input" aria-label={`${line.label}: furnizor sau destinație`} type="text" value={line.destination} onChange={(event) => updateExpense(line.id, "destination", event.target.value)} /></td>
        </tr>)}
      </tbody></table></div>
      <div className="expense-footnote"><strong>Originea este o estimare controlată de tine.</strong> Ponderea internă din prețul unui comerciant poate fi diferită de țara de origine a produsului, proprietarul firmei, proveniența materiilor prime, destinația impozitului sau locul de muncă al angajaților. Ponderea „extern / necunoscut” este doar un reper, nu o măsură verificată a ieșirii capitalului din țară.</div>
    </section>

    <section className="balance-summary-grid">
      <div className="balance-summary-card"><span>Contribuție la bugetul public</span><strong>{amount(model.taxes)} RON / lună</strong><small>Estimarea de impozite / contribuții introdusă de tine.</small></div>
      <div className="balance-summary-card"><span>Cheltuieli în economia internă</span><strong>{amount(totals.domesticSpending)} RON / lună</strong><small>Pondere locală estimată a cheltuielilor gospodăriei.</small></div>
      <div className="balance-summary-card"><span>Cheltuieli externe / necunoscute</span><strong>{amount(totals.externalOutflow)} RON / lună</strong><small>Pondere estimată ca externă sau cu origine necunoscută.</small></div>
      <div className="balance-summary-card"><span>Fluxul de numerar al gospodăriei</span><strong className={totals.available < 0 ? "negative-value" : ""}>{totals.available < 0 ? "−" : ""}{amount(Math.abs(totals.available))} RON / lună</strong><small>{totals.available < 0 ? "Cheltuielile depășesc intrările de bani introduse." : "Sold după impozitele și cheltuielile introduse."}</small></div>
    </section>
    <p className="balance-privacy-footnote">Acesta este un model personal de buget, nu un cont național, sfat fiscal, calculator de eligibilitate la beneficii sau măsură a valorii unui cetățean. Datele rămân în acest browser până când le resetezi sau ștergi datele site-ului.</p>
  </main>;
}

function BalanceKpi({ label, value, detail, tone = "" }: { label: string; value: string; detail: string; tone?: string }) {
  return <article className={`balance-kpi ${tone}`}><span>{label}</span><strong>{value} RON</strong><small>{detail}</small></article>;
}
