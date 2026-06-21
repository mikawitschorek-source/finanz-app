import { useState } from "react";
import { useData } from "../context/DataContext";

const EXPENSE_CATEGORIES = ["Miete","Lebensmittel","Fitnessstudio","Transport","Abonnements","Kleidung","Restaurant","Versicherung","Sonstiges"];
const CAT_EMOJI = { Miete:"🏠", Lebensmittel:"🛒", Fitnessstudio:"💪", Transport:"🚗", Abonnements:"📺", Kleidung:"👗", Restaurant:"🍽️", Versicherung:"🛡️", Sonstiges:"💸" };

export default function Budget() {
  const { expenses, budgets, setBudget, deleteBudget } = useData();
  const [editCat, setEditCat] = useState(null);
  const [inputVal, setInputVal] = useState("");

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

  const monthExpenses = expenses.filter(e => e.date?.startsWith(thisMonth));

  const getSpent = (cat) => monthExpenses.filter(e => e.category === cat).reduce((s,e) => s+(parseFloat(e.amount)||0), 0);
  const getBudget = (cat) => budgets.find(b => b.category === cat);

  const fmt = (n) => (parseFloat(n)||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const handleSave = async (cat) => {
    const val = parseFloat(inputVal);
    if (!val || val <= 0) return;
    await setBudget(cat, val);
    setEditCat(null);
    setInputVal("");
  };

  const totalBudget = budgets.reduce((s,b) => s+(b.amount||0), 0);
  const totalSpent = EXPENSE_CATEGORIES.reduce((s,cat) => s + getSpent(cat), 0);

  const monthName = now.toLocaleDateString("de-DE", { month: "long", year: "numeric" });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Budget</h2>
          <p className="page-sub">{monthName} · {fmt(totalSpent)} von {fmt(totalBudget)} verbraucht</p>
        </div>
      </div>

      {totalBudget > 0 && (
        <div className="budget-overview-card">
          <div className="budget-overview-label">Gesamtbudget diesen Monat</div>
          <div className="budget-overview-bar">
            <div className="budget-overview-fill" style={{ width: `${Math.min(100, (totalSpent/totalBudget)*100)}%`, background: totalSpent > totalBudget ? "var(--red)" : "var(--primary)" }} />
          </div>
          <div className="budget-overview-nums">
            <span>{fmt(totalSpent)} ausgegeben</span>
            <span>{fmt(Math.max(0, totalBudget - totalSpent))} übrig</span>
          </div>
        </div>
      )}

      <div className="budget-list">
        {EXPENSE_CATEGORIES.map(cat => {
          const spent = getSpent(cat);
          const budgetEntry = getBudget(cat);
          const limit = budgetEntry?.amount || 0;
          const pct = limit > 0 ? Math.min(100, (spent/limit)*100) : 0;
          const over = limit > 0 && spent > limit;
          const warn = limit > 0 && pct >= 80 && !over;
          const isEditing = editCat === cat;

          return (
            <div key={cat} className={`budget-item ${over ? "budget-over" : warn ? "budget-warn" : ""}`}>
              <div className="budget-item-top">
                <div className="budget-cat-info">
                  <span className="budget-emoji">{CAT_EMOJI[cat]}</span>
                  <span className="budget-cat-name">{cat}</span>
                  {over && <span className="budget-badge budget-badge-over">Überschritten!</span>}
                  {warn && <span className="budget-badge budget-badge-warn">Fast erreicht</span>}
                </div>
                <div className="budget-amounts">
                  {limit > 0 && (
                    <span className={`budget-spent ${over ? "text-red" : ""}`}>{fmt(spent)} / {fmt(limit)}</span>
                  )}
                  {!limit && spent > 0 && <span className="budget-spent-only">{fmt(spent)}</span>}
                  {isEditing ? (
                    <div className="budget-edit-inline">
                      <input
                        type="number" value={inputVal} autoFocus
                        onChange={e => setInputVal(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleSave(cat); if (e.key === "Escape") setEditCat(null); }}
                        placeholder="Limit €" className="budget-input"
                      />
                      <button className="btn-save-sm" onClick={() => handleSave(cat)}>✓</button>
                      <button className="btn-cancel-sm" onClick={() => setEditCat(null)}>✕</button>
                    </div>
                  ) : (
                    <button className="budget-set-btn" onClick={() => { setEditCat(cat); setInputVal(limit ? String(limit) : ""); }}>
                      {limit ? "✏️" : "+ Limit"}
                    </button>
                  )}
                  {limit > 0 && !isEditing && (
                    <button className="budget-del-btn" onClick={() => budgetEntry && deleteBudget(budgetEntry.id)}>🗑️</button>
                  )}
                </div>
              </div>
              {limit > 0 && (
                <div className="budget-bar">
                  <div className="budget-bar-fill" style={{ width: `${pct}%`, background: over ? "var(--red)" : warn ? "var(--orange)" : "var(--green)" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
