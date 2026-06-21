import { useState } from "react";
import { useData } from "../context/DataContext";
import { useYear } from "../context/YearContext";
import YearSwitcher from "../components/YearSwitcher";

const safeNum = v => parseFloat(v) || 0;
const fmt = n => safeNum(n).toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const freqLabel = { monthly: "Monatlich", weekly: "Wöchentlich", yearly: "Jährlich", once: "Einmalig", bimonthly: "Zweimonatlich", quarterly: "Quartalsweise", halfyearly: "Halbjährlich", biyearly: "Alle 2 Jahre" };
const catEmoji = { Miete: "🏠", Lebensmittel: "🛒", Fitnessstudio: "💪", Transport: "🚗", Abonnements: "📺", Kleidung: "👗", Restaurant: "🍽️", Versicherung: "🛡️", Sonstiges: "💸" };

export default function Expenses() {
  const { expenses, deleteExpense, getTotalExpensesForYear } = useData();
  const { selectedYear, isAllYears, years } = useYear();
  const [filter, setFilter] = useState("all");

  const displayYears = isAllYears ? years : [selectedYear];
  const total = displayYears.reduce((s, y) => s + getTotalExpensesForYear(y), 0);

  const filtered = expenses.filter(e => {
    const year = parseInt(e.date?.split("-")[0]);
    const inYear = isAllYears ? true : year === selectedYear;
    if (!inYear) return false;
    if (filter === "once") return e.frequency === "once";
    if (filter === "recurring") return e.frequency !== "once";
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDelete = async (id) => {
    if (id.includes("_carried_")) return;
    if (!window.confirm("Eintrag wirklich löschen?")) return;
    await deleteExpense(id);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Ausgaben</h2>
          <p className="page-sub">{filtered.length} Einträge · {fmt(total)}</p>
        </div>
      </div>
      <YearSwitcher />
      <div className="summary-banner red">
        <div className="summary-label">Gesamt Ausgaben</div>
        <div className="summary-value">{fmt(total)}</div>
        <div className="summary-sub">{isAllYears ? "Alle Jahre" : selectedYear}</div>
      </div>
      <div className="filter-tabs">
        {[["all","Alle"],["once","Einmalig"],["recurring","Wiederkehrend"]].map(([v,l]) => (
          <button key={v} className={`filter-tab ${filter===v?"active":""}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💸</div>
          <p>Keine Ausgaben</p>
          <p className="empty-sub">Tippe auf + um eine Ausgabe hinzuzufügen</p>
        </div>
      ) : (
        <div className="tx-list">
          {filtered.map(e => (
            <div key={e.id} className="tx-card">
              <div className="tx-card-left">
                <div className="tx-card-icon red">{catEmoji[e.category] || "💸"}</div>
                <div>
                  <div className="tx-card-name">{e.name || e.category}</div>
                  <div className="tx-card-meta">
                    {e.category} · {e.date}
                    {e.frequency !== "once" && (
                      <span className="recurring-badge carried">🔄 {freqLabel[e.frequency]||e.frequency}</span>
                    )}
                    {e.isCarried && <span className="recurring-badge carried">↩ Übertragen</span>}
                  </div>
                </div>
              </div>
              <div className="tx-card-right">
                <div className="tx-card-amount red">−{fmt(e.amount)}</div>
                {!e.isCarried && <button className="delete-btn" onClick={() => handleDelete(e.id)}>🗑️</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
