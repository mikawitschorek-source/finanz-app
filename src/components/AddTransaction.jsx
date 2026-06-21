import { useState } from "react";
import { useData } from "../context/DataContext";

const INCOME_CATS = ["Gehalt","Nebenjob","Taschengeld","Freelance","Sonstiges"];
const EXPENSE_CATS = ["Miete","Lebensmittel","Fitnessstudio","Transport","Abonnements","Kleidung","Restaurant","Versicherung","Sonstiges"];
const today = () => new Date().toISOString().split("T")[0];

const FREQ_OPTIONS = [
  { value:"monthly", label:"Monatlich", icon:"📅" },
  { value:"weekly", label:"Wöchentlich", icon:"🗓️" },
  { value:"bimonthly", label:"2-monatlich", icon:"📆" },
  { value:"quarterly", label:"Quartalsweise", icon:"🗂️" },
  { value:"halfyearly", label:"Halbjährlich", icon:"📊" },
  { value:"yearly", label:"Jährlich", icon:"🎯" },
  { value:"biyearly", label:"Alle 2 Jahre", icon:"🔁" },
];

export default function AddTransaction({ onClose }) {
  const { addIncome, addExpense } = useData();
  const [step, setStep] = useState(1);
  const [txType, setTxType] = useState("");
  const [subType, setSubType] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(today());
  const [frequency, setFreq] = useState("monthly");
  const [times, setTimes] = useState("1");
  const [costs, setCosts] = useState([{ type: "Versand", amount: "" }]);
  const [saving, setSaving] = useState(false);

  const totalCosts = costs.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const netProfit = (parseFloat(amount) || 0) - totalCosts;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setSaving(true);
    const base = { name: name || category, category: subType === "sale" ? "Verkauf" : (category || (txType === "income" ? INCOME_CATS[0] : EXPENSE_CATS[0])), date };
    if (txType === "income") {
      if (subType === "sale") await addIncome({ ...base, frequency: "once", times: 1, amount: parseFloat(amount), costs: totalCosts, netAmount: netProfit });
      else if (subType === "recurring") await addIncome({ ...base, frequency, times: parseInt(times) || 1, amount: parseFloat(amount), netAmount: parseFloat(amount) });
      else await addIncome({ ...base, frequency: "once", times: 1, amount: parseFloat(amount), netAmount: parseFloat(amount) });
    } else {
      if (subType === "recurring") await addExpense({ ...base, frequency, times: parseInt(times) || 1, amount: parseFloat(amount) });
      else await addExpense({ ...base, frequency: "once", times: 1, amount: parseFloat(amount) });
    }
    setSaving(false);
    onClose();
  };

  const cats = txType === "income" ? INCOME_CATS : EXPENSE_CATS;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        {step === 1 && (
          <>
            <div className="modal-title">Was möchtest du eintragen?</div>
            <div className="type-buttons">
              <button className="type-btn income" onClick={() => { setTxType("income"); setStep(2); }}>
                <div className="type-icon">↑</div>
                <div className="type-label">Einnahme</div>
                <div className="type-sub">Geld eingenommen</div>
              </button>
              <button className="type-btn expense" onClick={() => { setTxType("expense"); setStep(2); }}>
                <div className="type-icon">↓</div>
                <div className="type-label">Ausgabe</div>
                <div className="type-sub">Geld ausgegeben</div>
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <button className="back-btn" onClick={() => setStep(1)}>← Zurück</button>
            <div className="modal-title">{txType === "income" ? "Art der Einnahme" : "Art der Ausgabe"}</div>
            <div className="subtype-buttons">
              {txType === "income" ? (
                <>
                  <button className="subtype-btn" onClick={() => { setSubType("once"); setStep(3); }}>
                    <span>📅</span><div><p>Einmalig</p><small>Einmaliger Betrag</small></div>
                  </button>
                  <button className="subtype-btn" onClick={() => { setSubType("recurring"); setStep(3); }}>
                    <span>🔄</span><div><p>Wiederkehrend</p><small>Gehalt, Miete, Abo…</small></div>
                  </button>
                  <button className="subtype-btn" onClick={() => { setSubType("sale"); setStep(3); }}>
                    <span>🛒</span><div><p>Verkauf</p><small>Mit Kosten & Gewinnrechnung</small></div>
                  </button>
                </>
              ) : (
                <>
                  <button className="subtype-btn" onClick={() => { setSubType("once"); setStep(3); }}>
                    <span>📅</span><div><p>Einmalig</p><small>Einmaliger Betrag</small></div>
                  </button>
                  <button className="subtype-btn" onClick={() => { setSubType("recurring"); setStep(3); }}>
                    <span>🔄</span><div><p>Wiederkehrend</p><small>Monatliche Ausgabe</small></div>
                  </button>
                </>
              )}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <button className="back-btn" onClick={() => setStep(2)}>← Zurück</button>
            <div className="modal-title">
              {subType === "sale" ? "Verkauf eintragen" : subType === "recurring" ? "Wiederkehrend" : "Einmalig"} — {txType === "income" ? "Einnahme" : "Ausgabe"}
            </div>
            <form className="tx-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Name / Beschreibung</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder={txType === "income" ? "z.B. Gehalt Juni" : "z.B. Netflix"} />
              </div>
              <div className="input-group">
                <label>Kategorie</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  {cats.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>{subType === "sale" ? "Verkaufspreis (€)" : "Betrag (€)"}</label>
                <input type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" required />
              </div>
              <div className="input-group">
                <label>Datum</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              {subType === "recurring" && (
                <div className="recurring-options">
                  <label>Häufigkeit</label>
                  <div className="freq-grid">
                    {FREQ_OPTIONS.map(opt => (
                      <button key={opt.value} type="button" className={`freq-btn ${frequency === opt.value ? "active" : ""}`} onClick={() => setFreq(opt.value)}>
                        <span>{opt.icon}</span><span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {subType === "sale" && (
                <div className="recurring-options">
                  <label>Kosten abziehen</label>
                  {costs.map((c, i) => (
                    <div key={i} className="sale-cost-row">
                      <select value={c.type} onChange={e => setCosts(prev => prev.map((x,j) => j===i?{...x,type:e.target.value}:x))}>
                        {["Versand","Plattformgebühr","Verpackung","Einkaufspreis","Sonstiges"].map(t=><option key={t}>{t}</option>)}
                      </select>
                      <input type="number" step="0.01" min="0" placeholder="€" value={c.amount} onChange={e => setCosts(prev => prev.map((x,j) => j===i?{...x,amount:e.target.value}:x))} />
                      {costs.length > 1 && <button type="button" onClick={() => setCosts(prev=>prev.filter((_,j)=>j!==i))}>×</button>}
                    </div>
                  ))}
                  <button type="button" className="add-cost-btn" onClick={() => setCosts(prev=>[...prev,{type:"Versand",amount:""}])}>+ Kosten hinzufügen</button>
                  {totalCosts > 0 && (
                    <div className="profit-preview">
                      Gewinn: {netProfit.toLocaleString("de-DE",{style:"currency",currency:"EUR"})} (Umsatz {parseFloat(amount||0).toLocaleString("de-DE",{style:"currency",currency:"EUR"})} − Kosten {totalCosts.toLocaleString("de-DE",{style:"currency",currency:"EUR"})})
                    </div>
                  )}
                </div>
              )}
              <button type="submit" className="btn-primary submit-btn" disabled={saving}>
                {saving ? "Speichern…" : "Eintrag speichern"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
