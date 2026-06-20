import { useState } from "react";
import { useData } from "../context/DataContext";
import { useYear } from "../context/YearContext";
import YearSwitcher from "../components/YearSwitcher";

const safeNum = v => parseFloat(v) || 0;
const fmt = n => safeNum(n).toLocaleString("de-DE", { style:"currency", currency:"EUR" });
const freqLabel = { monthly:"Monatlich", weekly:"Wöchentlich", yearly:"Jährlich", once:"Einmalig" };
const catEmoji  = { Miete:"🏠", Lebensmittel:"🛒", Fitnessstudio:"💪", Transport:"🚗", Abonnements:"📺", Kleidung:"👗", Restaurant:"🍽️", Versicherung:"🛡️", Sonstiges:"💸" };

export default function Expenses() {
  const { expenses, deleteExpense, getTotalExpensesForYear } = useData();
  const { selectedYear, isAllYears, years } = useYear();
  const [filter, setFilter] = useState("all");

  const displayYears = isAllYears ? years : [selectedYear];
  const total = displayYears.reduce((s,y) => s + getTotalExpensesForYear(y), 0);

  const filtered = expenses.filter(e => {
    const year = parseInt(e.date?.split("-")[0]);
    const inYear = isAllYears ? true : year === selectedYear;
    if (!inYear) return false;
    if (filter === "once") return e.frequency === "once";
    if (filter === "recurring") return e.frequency !== "once";
    return true;
  }).sort((a,b) => new Date(b.date) - new Date(a.date));

  const handleDelete = async (id) => {
    if (id.includes("_carried_")) return;
    if (!window.confirm("Eintrag wirklich löschen?")) return;
    await deleteExpense(id);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><h2>Ausgaben</h2><p className="page-sub">{filtered.length} Einträge</p></div>
        <div className="total-badge red">{fmt(total)}</div>
      </div>
      <YearSwitcher />
      <div className="filter-row">
        {["all","once","recurring"].map(f => (
          <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>
            {f==="all"?"Alle":f==="once"?"Einmalig":"Wiederkehrend"}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📤</div>
          <p>Keine Ausgaben</p>
          <p className="empty-sub">Tippe auf + um eine Ausgabe hinzuzufügen</p>
        </div>
      ) : filtered.map(e => (
        <div key={e.id} className="transaction-item">
          <div className="tx-icon-wrap expense">{catEmoji[e.category]||"💸"}</div>
          <div className="tx-info">
            <div className="tx-name">{e.name || e.category}</div>
            <div className="tx-date">{e.date} · {freqLabel[e.frequency]||e.frequency}{e.isCarried && <span className="carried-badge"> (übertragen)</span>}</div>
          </div>
          <div className="tx-right">
            <div className="tx-amount expense">−{fmt(safeNum(e.amount))}</div>
            {!e.isCarried && <button className="delete-btn" onClick={()=>handleDelete(e.id)} aria-label="Löschen">🗑</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
