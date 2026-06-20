import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { useYear } from "../context/YearContext";
import YearSwitcher from "../components/YearSwitcher";

const safeNum = v => parseFloat(v) || 0;
const fmt = (n, showSign=false) => {
  const num = safeNum(n);
  const f = Math.abs(num).toLocaleString("de-DE", { style:"currency", currency:"EUR" });
  if (showSign && num > 0) return "+" + f;
  if (num < 0) return "−" + f;
  return f;
};

export default function Analytics() {
  const { income, expenses, getTotalIncomeForYear, getTotalExpensesForYear } = useData();
  const { selectedYear, isAllYears, years } = useYear();

  const displayYears = isAllYears ? years : [selectedYear];
  const totalIncome   = displayYears.reduce((s,y) => s + getTotalIncomeForYear(y), 0);
  const totalExpenses = displayYears.reduce((s,y) => s + getTotalExpensesForYear(y), 0);
  const balance       = totalIncome - totalExpenses;

  const filteredIncome   = income.filter(i => displayYears.includes(parseInt(i.date?.split("-")[0])));
  const filteredExpenses = expenses.filter(e => displayYears.includes(parseInt(e.date?.split("-")[0])));

  const sales     = filteredIncome.filter(i => i.category === "Verkauf");
  const saleRev   = sales.reduce((s,i) => s + safeNum(i.amount), 0);
  const saleCosts = sales.reduce((s,i) => s + safeNum(i.costs), 0);
  const saleNet   = sales.reduce((s,i) => s + safeNum(i.netAmount ?? i.amount), 0);

  const expCats = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => { map[e.category] = (map[e.category]||0) + safeNum(e.amount); });
    return Object.entries(map).sort((a,b) => b[1]-a[1]);
  }, [filteredExpenses]);

  const incCats = useMemo(() => {
    const map = {};
    filteredIncome.forEach(i => { map[i.category] = (map[i.category]||0) + safeNum(i.netAmount??i.amount); });
    return Object.entries(map).sort((a,b) => b[1]-a[1]);
  }, [filteredIncome]);

  const maxExp = expCats[0]?.[1] || 1;
  const maxInc = incCats[0]?.[1] || 1;
  const hasData = filteredIncome.length > 0 || filteredExpenses.length > 0;

  return (
    <div className="page">
      <div className="page-header">
        <div><h2>Analyse</h2><p className="page-sub">{isAllYears?"Alle Jahre":selectedYear}</p></div>
      </div>
      <YearSwitcher />
      {!hasData ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>Noch keine Daten</p>
          <p className="empty-sub">Füge Einträge hinzu um die Analyse zu sehen</p>
        </div>
      ) : (
        <>
          <div className="kpi-grid">
            <div className="kpi-card kpi-green"><div className="kpi-glow"></div><div className="kpi-label">📥 Einnahmen</div><div className="kpi-value">{fmt(totalIncome)}</div></div>
            <div className="kpi-card kpi-red"><div className="kpi-glow"></div><div className="kpi-label">📤 Ausgaben</div><div className="kpi-value">{fmt(totalExpenses)}</div></div>
            <div className={`kpi-card ${balance>=0?"kpi-green":"kpi-red"}`} style={{gridColumn:"span 2"}}><div className="kpi-glow"></div><div className="kpi-label">📊 Bilanz</div><div className="kpi-value">{fmt(balance,true)}</div></div>
          </div>
          {sales.length > 0 && (
            <div className="analytics-section">
              <h3>🛒 Verkäufe</h3>
              <div className="stats-grid">
                <div className="stat-item"><span className="stat-label">Umsatz</span><span className="stat-value">{fmt(saleRev)}</span></div>
                <div className="stat-item"><span className="stat-label">Kosten</span><span className="stat-value red">−{fmt(saleCosts)}</span></div>
                <div className="stat-item"><span className="stat-label">Gewinn</span><span className="stat-value green">{fmt(saleNet)}</span></div>
              </div>
            </div>
          )}
          {expCats.length > 0 && (
            <div className="analytics-section">
              <h3>📤 Ausgaben nach Kategorie</h3>
              {expCats.map(([cat,val]) => (
                <div key={cat} className="category-bar-row">
                  <div className="cat-label">{cat}</div>
                  <div className="cat-bar-wrap"><div className="cat-bar red" style={{width:`${Math.round((val/maxExp)*100)}%`}}></div></div>
                  <div className="cat-val red">{fmt(val)}</div>
                </div>
              ))}
            </div>
          )}
          {incCats.length > 0 && (
            <div className="analytics-section">
              <h3>📥 Einnahmen nach Kategorie</h3>
              {incCats.map(([cat,val]) => (
                <div key={cat} className="category-bar-row">
                  <div className="cat-label">{cat}</div>
                  <div className="cat-bar-wrap"><div className="cat-bar green" style={{width:`${Math.round((val/maxInc)*100)}%`}}></div></div>
                  <div className="cat-val green">{fmt(val)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
