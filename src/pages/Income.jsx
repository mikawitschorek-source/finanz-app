import { useState } from "react";
import { useData } from "../context/DataContext";
import { useYear } from "../context/YearContext";
import YearSwitcher from "../components/YearSwitcher";

const safeNum = v => parseFloat(v) || 0;
const fmt = n => safeNum(n).toLocaleString("de-DE", { style:"currency", currency:"EUR" });
const freqLabel = { monthly:"Monatlich", weekly:"Wöchentlich", yearly:"Jährlich", once:"Einmalig" };
const freqIcon  = { monthly:"🔄", weekly:"🔄", yearly:"🔄", once:"📅" };
const catEmoji  = { Gehalt:"👔", Nebenjob:"💼", Taschengeld:"🪙", Freelance:"💻", Verkauf:"🛒", Sonstiges:"💰" };

export default function Income() {
  const { income, deleteIncome, getTotalIncomeForYear } = useData();
  const { selectedYear, isAllYears, years } = useYear();
  const [filter, setFilter] = useState("all");

  const displayYears = isAllYears ? years : [selectedYear];
  const total = displayYears.reduce((s,y) => s + getTotalIncomeForYear(y), 0);

  const filtered = income.filter(i => {
    const year = parseInt(i.date?.split("-")[0]);
    const inYear = isAllYears ? true : year === selectedYear;
    if (!inYear) return false;
    if (filter === "once") return i.frequency === "once";
    if (filter === "recurring") return i.frequency !== "once";
    if (filter === "sale") return i.category === "Verkauf";
    return true;
  }).sort((a,b) => new Date(b.date) - new Date(a.date));

  const handleDelete = async (id) => {
    if (id.includes("_carried_")) return;
    if (!window.confirm("Eintrag wirklich löschen?")) return;
    await deleteIncome(id);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><h2>Einnahmen</h2><p className="page-sub">{filtered.length} Einträge</p></div>
        <div className="total-badge green">{fmt(total)}</div>
      </div>
      <YearSwitcher />
      <div className="filter-row">
        {["all","once","recurring","sale"].map(f => (
          <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>
            {f==="all"?"Alle":f==="once"?"Einmalig":f==="recurring"?"Wiederkehrend":"Verkäufe"}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📥</div>
          <p>Keine Einnahmen</p>
          <p className="empty-sub">Tippe auf + um eine Einnahme hinzuzufügen</p>
        </div>
      ) : filtered.map(i => (
        <div key={i.id} className="transaction-item">
          <div className="tx-icon-wrap income">{catEmoji[i.category]||"💰"}</div>
          <div className="tx-info">
            <div className="tx-name">{i.name || i.category}</div>
            <div className="tx-date">{i.date} · {freqIcon[i.frequency]} {freqLabel[i.frequency]||i.frequency}{i.isCarried && <span className="carried-badge"> (übertragen)</span>}</div>
          </div>
          <div className="tx-right">
            <div className="tx-amount income">+{fmt(safeNum(i.netAmount??i.amount))}</div>
            {!i.isCarried && <button className="delete-btn" onClick={()=>handleDelete(i.id)} aria-label="Löschen">🗑</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
