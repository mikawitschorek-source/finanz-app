import { useState } from "react";
import { useData } from "../context/DataContext";
import { useYear } from "../context/YearContext";
import YearSwitcher from "../components/YearSwitcher";

const safeNum = v => parseFloat(v) || 0;
const fmt = n => safeNum(n).toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const freqLabel = { monthly: "Monatlich", weekly: "Wöchentlich", yearly: "Jährlich", once: "Einmalig", bimonthly: "Zweimonatlich", quarterly: "Quartalsweise", halfyearly: "Halbjährlich", biyearly: "Alle 2 Jahre" };
const freqIcon = { monthly: "🔄", weekly: "🔄", yearly: "🔄", once: "📅", bimonthly: "🔄", quarterly: "🔄", halfyearly: "🔄", biyearly: "🔄" };
const catEmoji = { Gehalt: "👔", Nebenjob: "💼", Taschengeld: "🪙", Freelance: "💻", Verkauf: "🛒", Sonstiges: "💰" };

export default function Income() {
  const { income, deleteIncome, getTotalIncomeForYear } = useData();
  const { selectedYear, isAllYears, years } = useYear();
  const [filter, setFilter] = useState("all");

  const displayYears = isAllYears ? years : [selectedYear];
  const total = displayYears.reduce((s, y) => s + getTotalIncomeForYear(y), 0);

  const filtered = income.filter(i => {
    const year = parseInt(i.date?.split("-")[0]);
    const inYear = isAllYears ? true : year === selectedYear;
    if (!inYear) return false;
    if (filter === "once") return i.frequency === "once";
    if (filter === "recurring") return i.frequency !== "once";
    if (filter === "sale") return i.category === "Verkauf";
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDelete = async (id) => {
    if (id.includes("_carried_")) return;
    if (!window.confirm("Eintrag wirklich löschen?")) return;
    await deleteIncome(id);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Einnahmen</h2>
          <p className="page-sub">{filtered.length} Einträge · {fmt(total)}</p>
        </div>
      </div>
      <YearSwitcher />
      <div className="summary-banner green">
        <div className="summary-label">Gesamt Einnahmen</div>
        <div className="summary-value">{fmt(total)}</div>
        <div className="summary-sub">{isAllYears ? "Alle Jahre" : selectedYear}</div>
      </div>
      <div className="filter-tabs">
        {[["all","Alle"],["once","Einmalig"],["recurring","Wiederkehrend"],["sale","Verkäufe"]].map(([v,l]) => (
          <button key={v} className={`filter-tab ${filter===v?"active":""}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <p>Keine Einnahmen</p>
          <p className="empty-sub">Tippe auf + um eine Einnahme hinzuzufügen</p>
        </div>
      ) : (
        <div className="tx-list">
          {filtered.map(i => (
            <div key={i.id} className="tx-card">
              <div className="tx-card-left">
                <div className="tx-card-icon green">{catEmoji[i.category] || "💰"}</div>
                <div>
                  <div className="tx-card-name">{i.name || i.category}</div>
                  <div className="tx-card-meta">
                    {i.category} · {i.date}
                    {i.frequency !== "once" && (
                      <span className="recurring-badge carried">{freqIcon[i.frequency]} {freqLabel[i.frequency]||i.frequency}</span>
                    )}
                    {i.isCarried && <span className="recurring-badge carried">↩ Übertragen</span>}
                  </div>
                  {i.costs > 0 && <div className="tx-card-costs">Kosten: −{fmt(i.costs)}</div>}
                </div>
              </div>
              <div className="tx-card-right">
                <div className="tx-card-amount green">+{fmt(i.netAmount ?? i.amount)}</div>
                {!i.isCarried && <button className="delete-btn" onClick={() => handleDelete(i.id)}>🗑️</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
