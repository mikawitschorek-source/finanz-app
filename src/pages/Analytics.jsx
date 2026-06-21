import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { useYear } from "../context/YearContext";
import YearSwitcher from "../components/YearSwitcher";

const safeNum = v => parseFloat(v) || 0;
const fmt = (n, showSign = false) => {
  const num = safeNum(n);
  const f = Math.abs(num).toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  if (showSign && num > 0) return "+" + f;
  if (num < 0) return "−" + f;
  return f;
};

export default function Analytics() {
  const { income, expenses, getTotalIncomeForYear, getTotalExpensesForYear } = useData();
  const { selectedYear, isAllYears, years } = useYear();

  const displayYears = isAllYears ? years : [selectedYear];
  const totalIncome = displayYears.reduce((s, y) => s + getTotalIncomeForYear(y), 0);
  const totalExpenses = displayYears.reduce((s, y) => s + getTotalExpensesForYear(y), 0);
  const balance = totalIncome - totalExpenses;

  const filteredIncome = income.filter(i => displayYears.includes(parseInt(i.date?.split("-")[0])));
  const filteredExpenses = expenses.filter(e => displayYears.includes(parseInt(e.date?.split("-")[0])));

  const sales = filteredIncome.filter(i => i.category === "Verkauf");
  const saleRev = sales.reduce((s, i) => s + safeNum(i.amount), 0);
  const saleCosts = sales.reduce((s, i) => s + safeNum(i.costs), 0);
  const saleNet = sales.reduce((s, i) => s + safeNum(i.netAmount ?? i.amount), 0);

  const expCats = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => { map[e.category] = (map[e.category] || 0) + safeNum(e.amount); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  const incCats = useMemo(() => {
    const map = {};
    filteredIncome.forEach(i => { map[i.category] = (map[i.category] || 0) + safeNum(i.netAmount ?? i.amount); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredIncome]);

  const maxExp = expCats[0]?.[1] || 1;
  const maxInc = incCats[0]?.[1] || 1;
  const hasData = filteredIncome.length > 0 || filteredExpenses.length > 0;
  const sparquote = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Analyse</h2>
          <p className="page-sub">{isAllYears ? "Alle Jahre" : selectedYear}</p>
        </div>
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
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-label">Einnahmen</div>
              <div className="analytics-value green">{fmt(totalIncome)}</div>
              <div className="analytics-sub">{filteredIncome.length} Einträge</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-label">Ausgaben</div>
              <div className="analytics-value red">{fmt(totalExpenses)}</div>
              <div className="analytics-sub">{filteredExpenses.length} Einträge</div>
            </div>
            <div className={`analytics-card profit`}>
              <div className="analytics-label">Bilanz</div>
              <div className={`analytics-value ${balance >= 0 ? "blue" : "red"}`}>{fmt(balance, true)}</div>
              <div className="analytics-sub">Sparquote: {sparquote}%</div>
            </div>
          </div>

          {sales.length > 0 && (
            <div className="chart-card">
              <div className="chart-header"><h3>🛒 Verkaufsstatistik</h3></div>
              <div className="sales-stats">
                <div><div className="sales-label">Umsatz</div><div className="sales-val">{fmt(saleRev)}</div></div>
                <div><div className="sales-label">Kosten</div><div className="sales-val red">−{fmt(saleCosts)}</div></div>
                <div><div className="sales-label">Gewinn</div><div className="sales-val green">{fmt(saleNet)}</div></div>
              </div>
            </div>
          )}

          {expCats.length > 0 && (
            <div className="chart-card">
              <div className="chart-header"><h3>Ausgaben nach Kategorie</h3></div>
              <div className="category-bars">
                {expCats.map(([cat, val]) => (
                  <div key={cat} className="cat-bar-row">
                    <div className="cat-bar-label"><span>{cat}</span><span>{fmt(val)}</span></div>
                    <div className="cat-bar-bg"><div className="cat-bar-fill" style={{ width: `${(val / maxExp) * 100}%` }} /></div>
                    <div className="cat-bar-pct">{Math.round((val / totalExpenses) * 100)}% der Ausgaben</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {incCats.length > 0 && (
            <div className="chart-card">
              <div className="chart-header"><h3>Einnahmen nach Kategorie</h3></div>
              <div className="category-bars">
                {incCats.map(([cat, val]) => (
                  <div key={cat} className="cat-bar-row">
                    <div className="cat-bar-label"><span>{cat}</span><span>{fmt(val)}</span></div>
                    <div className="cat-bar-bg"><div className="cat-bar-fill cat-bar-fill green" style={{ width: `${(val / maxInc) * 100}%` }} /></div>
                    <div className="cat-bar-pct">{Math.round((val / totalIncome) * 100)}% der Einnahmen</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
