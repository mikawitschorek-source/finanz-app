import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { useYear } from "../context/YearContext";
import { useAuth } from "../context/AuthContext";
import YearSwitcher from "../components/YearSwitcher";
import { exportToExcel } from "./exportExcel";

const safeNum = (v) => parseFloat(v) || 0;
const fmt = (n, showSign = false) => {
  const num = safeNum(n);
  const f = Math.abs(num).toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  if (showSign && num > 0) return "+" + f;
  if (num < 0) return "−" + f;
  return f;
};

function MiniBarChart({ years, getTotalIncomeForYear, getTotalExpensesForYear }) {
  if (years.length === 0) return null;
  const data = years.slice(-7).map(y => ({
    y,
    inc: getTotalIncomeForYear(y),
    exp: getTotalExpensesForYear(y)
  }));
  const max = Math.max(...data.flatMap(d => [d.inc, d.exp]), 1);
  const now = new Date().getFullYear();
  return (
    <div className="mini-bar-chart">
      {data.map(({ y, inc, exp }) => (
        <div key={y} className="bar-group">
          <div className="bars">
            <div className="bar bar-income" style={{ height: `${(inc / max) * 100}%` }} title={`Einnahmen: ${fmt(inc)}`} />
            <div className="bar bar-expense" style={{ height: `${(exp / max) * 100}%` }} title={`Ausgaben: ${fmt(exp)}`} />
          </div>
          <span className={`bar-label ${y === now ? "bar-label-current" : ""}`}>{y}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { income, expenses, wallets, getTotalIncomeForYear, getTotalExpensesForYear } = useData();
  const { selectedYear, isAllYears, years } = useYear();
  const { user, logout } = useAuth();

  const displayYears = isAllYears ? years : [selectedYear];
  const totalIncome = displayYears.reduce((s, y) => s + getTotalIncomeForYear(y), 0);
  const totalExpenses = displayYears.reduce((s, y) => s + getTotalExpensesForYear(y), 0);
  const balance = totalIncome - totalExpenses;
  const totalWealth = wallets.reduce((s, w) => s + safeNum(w.amount), 0);

  const recentTransactions = useMemo(() => {
    const all = [
      ...income.map(i => ({ ...i, _type: "income" })),
      ...expenses.map(e => ({ ...e, _type: "expense" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    return all.slice(0, 5);
  }, [income, expenses]);

  const today = new Date().toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const handleExport = () => {
    exportToExcel(income, expenses, wallets);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{today}</p>
        </div>
        <div className="header-actions">
          <YearSwitcher />
          <button className="btn-export" onClick={handleExport} title="Alle Daten als Excel exportieren">
            📊 Excel Export
          </button>
          <button className="btn-logout" onClick={logout} title="Abmelden">⎋</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-income">
          <span className="kpi-icon">💰</span>
          <div>
            <p className="kpi-label">Einnahmen</p>
            <p className="kpi-value">{fmt(totalIncome)}</p>
          </div>
        </div>
        <div className="kpi-card kpi-expense">
          <span className="kpi-icon">💸</span>
          <div>
            <p className="kpi-label">Ausgaben</p>
            <p className="kpi-value">{fmt(totalExpenses)}</p>
          </div>
        </div>
        <div className={`kpi-card ${balance >= 0 ? "kpi-positive" : "kpi-negative"}`}>
          <span className="kpi-icon">{balance >= 0 ? "📈" : "📉"}</span>
          <div>
            <p className="kpi-label">Bilanz</p>
            <p className="kpi-value">{fmt(balance, true)}</p>
          </div>
        </div>
        <div className="kpi-card kpi-wealth">
          <span className="kpi-icon">🏦</span>
          <div>
            <p className="kpi-label">Gesamtvermögen</p>
            <p className="kpi-value">{fmt(totalWealth)}</p>
          </div>
        </div>
      </div>

      {years.length > 1 && (
        <div className="card chart-card">
          <h2 className="card-title">Jahresvergleich</h2>
          <MiniBarChart years={years} getTotalIncomeForYear={getTotalIncomeForYear} getTotalExpensesForYear={getTotalExpensesForYear} />
          <div className="chart-legend">
            <span className="legend-income">■ Einnahmen</span>
            <span className="legend-expense">■ Ausgaben</span>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Letzte Transaktionen</h2>
        {recentTransactions.length === 0 ? (
          <div className="empty-state">
            <p>Noch keine Einträge</p>
            <p className="empty-hint">Füge deinen ersten Eintrag hinzu</p>
          </div>
        ) : (
          <ul className="transaction-list">
            {recentTransactions.map(t => (
              <li key={t.id} className="transaction-item">
                <span className="transaction-name">{t.name}</span>
                <span className={`transaction-amount ${t._type === "income" ? "amount-positive" : "amount-negative"}`}>
                  {t._type === "income" ? "+" : "−"}{fmt(t._type === "income" ? (t.netAmount ?? t.amount) : t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
