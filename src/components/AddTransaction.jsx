import { useState } from "react";
import { useData } from "../context/DataContext";

const INCOME_CATS  = ["Gehalt","Nebenjob","Taschengeld","Freelance","Sonstiges"];
const EXPENSE_CATS = ["Miete","Lebensmittel","Fitnessstudio","Transport","Abonnements","Kleidung","Restaurant","Versicherung","Sonstiges"];
const today = () => new Date().toISOString().split("T")[0];

const FREQ_OPTIONS = [
  { value: "weekly",    label: "Wöchentlich",      icon: "7️⃣" },
  { value: "monthly",   label: "Monatlich",         icon: "📅" },
  { value: "bimonthly", label: "Alle 2 Monate",     icon: "2️⃣" },
  { value: "quarterly", label: "Alle 3 Monate",     icon: "3️⃣" },
  { value: "halfyearly",label: "Alle 6 Monate",     icon: "6️⃣" },
  { value: "yearly",    label: "Jährlich",           icon: "🗓️" },
  { value: "biyearly",  label: "Alle 2 Jahre",       icon: "📆" },
];

export default function AddTransaction({ onClose }) {
  const { addIncome, addExpense } = useData();
  const [step, setStep]       = useState(1);
  const [txType, setTxType]   = useState("");
  const [subType, setSubType] = useState("");
  const [name, setName]       = useState("");
  const [amount, setAmount]   = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate]       = useState(today());
  const [frequency, setFreq]  = useState("monthly");
  const [times, setTimes]     = useState("1");
  const [costs, setCosts]     = useState([{ type: "Versand", amount: "" }]);
  const [saving, setSaving]   = useState(false);

  const totalCosts = costs.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const netProfit  = (parseFloat(amount) || 0) - totalCosts;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setSaving(true);
    const base = {
      name: name || category,
      category: subType === "sale" ? "Verkauf" : (category || (txType === "income" ? INCOME_CATS[0] : EXPENSE_CATS[0])),
      date
    };
    if (txType === "income") {
      if (subType === "sale")      await addIncome({ ...base, frequency: "once", times: 1, amount: parseFloat(amount), costs: totalCosts, netAmount: netProfit });
      else if (subType === "recurring") await addIncome({ ...base, frequency, times: parseInt(times) || 1, amount: parseFloat(amount), netAmount: parseFloat(amount) });
      else                         await addIncome({ ...base, frequency: "once", times: 1, amount: parseFloat(amount), netAmount: parseFloat(amount) });
    } else {
      if (subType === "recurring") await addExpense({ ...base, frequency, times: parseInt(times) || 1, amount: parseFloat(amount) });
      else                         await addExpense({ ...base, frequency: "once", times: 1, amount: parseFloat(amount) });
    }
    setSaving(false);
    onClose();
  };

  const cats = txType === "income" ? INCOME_CATS : EXPENSE_CATS;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />

        {/* Step 1 – Typ */}
        {step === 1 && (
          <>
            <p className="modal-title">Was möchtest du eintragen?</p>
            <div className="type-buttons">
              <button className="type-btn income" onClick={() => { setTxType("income"); setStep(2); }}>
                <span className="type-icon">💰</span>
                <span className="type-label">Einnahme</span>
                <span className="type-sub">Geld kommt rein</span>
              </button>
              <button className="type-btn expense" onClick={() => { setTxType("expense"); setStep(2); setSubType(""); }}>
                <span className="type-icon">💸</span>
                <span className="type-label">Ausgabe</span>
                <span className="type-sub">Geld geht raus</span>
              </button>
            </div>
          </>
        )}

        {/* Step 2 – Subtyp */}
        {step === 2 && (
          <>
            <button className="back-btn" onClick={() => setStep(1)}>← Zurück</button>
            <p className="modal-title">{txType === "income" ? "Art der Einnahme" : "Art der Ausgabe"}</p>
            <div className="subtype-buttons">
              <button className="subtype-btn" onClick={() => { setSubType("once"); setStep(3); }}>
                <span>💵</span>
                <div><p>Einmalig</p><small>Einmalige Zahlung</small></div>
              </button>
              <button className="subtype-btn" onClick={() => { setSubType("recurring"); setStep(3); }}>
                <span>🔁</span>
                <div><p>Wiederkehrend</p><small>Regelmäßige Zahlung</small></div>
              </button>
              {txType === "income" && (
                <button className="subtype-btn" onClick={() => { setSubType("sale"); setStep(3); }}>
                  <span>🛍️</span>
                  <div><p>Verkauf</p><small>Verkaufserlös mit Kosten-Abzug</small></div>
                </button>
              )}
            </div>
          </>
        )}

        {/* Step 3 – Formular */}
        {step === 3 && (
          <>
            <button className="back-btn" onClick={() => setStep(2)}>← Zurück</button>
            <p className="modal-title">
              {subType === "sale" ? "Verkauf" : subType === "recurring" ? "Wiederkehrend" : "Einmalig"} — {txType === "income" ? "Einnahme" : "Ausgabe"}
            </p>
            <form onSubmit={handleSubmit} className="tx-form">
              <div className="input-group">
                <label>Name / Beschreibung</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="z.B. Fitnessstudio Abo" />
              </div>

              {subType !== "sale" && (
                <div className="input-group">
                  <label>Kategorie</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    {cats.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {/* Verkauf */}
              {subType === "sale" ? (
                <>
                  <div className="input-group">
                    <label>Verkaufspreis</label>
                    <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
                  </div>
                  <div className="input-group">
                    <label>Kosten abziehen</label>
                    {costs.map((c, i) => (
                      <div key={i} className="sale-cost-row">
                        <select value={c.type} onChange={e => { const n=[...costs]; n[i].type=e.target.value; setCosts(n); }}>
                          {["Versand","Einkauf","Gebühren","Sonstiges"].map(t => <option key={t}>{t}</option>)}
                        </select>
                        <input type="number" step="0.01" min="0" placeholder="0.00" value={c.amount} onChange={e => { const n=[...costs]; n[i].amount=e.target.value; setCosts(n); }} />
                        {costs.length > 1 && <button type="button" onClick={() => setCosts(costs.filter((_,j)=>j!==i))}>✕</button>}
                      </div>
                    ))}
                    <button type="button" className="add-cost-btn" onClick={() => setCosts([...costs,{type:"Sonstiges",amount:""}])}>+ Kosten hinzufügen</button>
                  </div>
                  {parseFloat(amount) > 0 && (
                    <div className="profit-preview">Netto-Gewinn: <strong>{netProfit.toLocaleString("de-DE",{style:"currency",currency:"EUR"})}</strong></div>
                  )}
                </>
              ) : (
                <div className="input-group">
                  <label>Betrag</label>
                  <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
                </div>
              )}

              {/* Wiederkehrend: Intervall-Auswahl */}
              {subType === "recurring" && (
                <div className="input-group">
                  <label>Häufigkeit</label>
                  <div className="freq-grid">
                    {FREQ_OPTIONS.map(f => (
                      <button
                        key={f.value}
                        type="button"
                        className={`freq-btn ${frequency === f.value ? "active" : ""}`}
                        onClick={() => setFreq(f.value)}
                      >
                        <span>{f.icon}</span>
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="input-group" style={{marginTop:10,marginBottom:0}}>
                    <label>Anzahl Wiederholungen</label>
                    <input type="number" min="1" value={times} onChange={e => setTimes(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label>Datum</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>

              <button type="submit" className="btn-primary submit-btn" disabled={saving}>
                {saving ? "Speichern…" : "Eintragen"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
