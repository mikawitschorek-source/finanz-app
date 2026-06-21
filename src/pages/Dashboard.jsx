import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { useYear } from "../context/YearContext";
import { useAuth } from "../context/AuthContext";
import YearSwitcher from "../components/YearSwitcher";

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
  const data = years.slice(-7).map(y => ({ y, inc: getTotalIncomeForYear(y), exp: getTotalExpensesForYear(y) }));
  const max = Math.max(...data.flatMap(d => [d.inc, d.exp]), 1);
  const now = new Date().getFullYear();
  return (
    <div className="bar-chart">
      {data.map(d => (
        <div key={d.y} className={`bar-group ${d.y === now ? "current" : ""}`}>
          <div className="bars">
            <div className="bar bar-income" style={{ height: `${(d.inc / max) * 100}%` }} />
            <div className="bar bar-expense" style={{ height: `${(d.exp / max) * 100}%` }} />
          </div>
          <div className="bar-label">{String(d.y).slice(-2)}</div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const { income, expenses, wallets, getTotalIncomeForYear, getTotalExpensesForYear, goals } = useData();
  const { selectedYear, isAllYears, years } = useYear();
  const { user } = useAuth();

  const displayYears = isAllYears ? years : [selectedYear];
  const totalIncome = displayYears.reduce((s, y) => s + getTotalIncomeForYear(y), 0);
  const totalExpenses = displayYears.reduce((s, y) => s + getTotalExpensesForYear(y), 0);
  const balance = totalIncome - totalExpenses;
  const totalWealth = wallets.reduce((s, w) => s + safeNum(w.amount), 0);
  const sparquote = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  const recentTx = useMemo(() => {
    const inc = income.filter(i => !i.id?.includes("_carried_")).map(i => ({ ...i, _type: "income" }));
    const exp = expenses.filter(e => !e.id?.includes("_carried_")).map(e => ({ ...e, _type: "expense" }));
    return [...inc, ...exp].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  }, [income, expenses]);

  const today = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Guten Morgen";
    if (h < 18) return "Guten Tag";
    return "Guten Abend";
  };
  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "";

  const goalsProgress = (goals || []).filter(g => g.targetAmount > 0).slice(0, 3);

  return (
    <div className="page">
      <div className="dashboard-header">
        <div>
          <div className="greeting">{greet()}{firstName ? `, ${firstName}` : ""} 👋</div>
          <div className="date-label">{today}</div>
        </div>
      </div>

      <YearSwitcher />

      <div className="kpi-grid">
        <div className="kpi-card kpi-primary">
          <div className="kpi-glow" />
          <div className="kpi-label">Bilanz</div>
          <div className="kpi-value">{fmt(balance, true)}</div>
          <div className="kpi-sub">Sparquote: {sparquote}%</div>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-glow" />
          <div className="kpi-label">Einnahmen</div>
          <div className="kpi-value">{fmt(totalIncome)}</div>
          <div className="kpi-sub">{isAllYears ? "Alle Jahre" : selectedYear}</div>
        </div>
        <div className="kpi-card kpi-red">
          <div className="kpi-glow" />
          <div className="kpi-label">Ausgaben</div>
          <div className="kpi-value">{fmt(totalExpenses)}</div>
          <div className="kpi-sub">{isAllYears ? "Alle Jahre" : selectedYear}</div>
        </div>
        <div className="kpi-card kpi-blue">
          <div className="kpi-glow" />
          <div className="kpi-label">Vermögen</div>
          <div className="kpi-value">{fmt(totalWealth)}</div>
          <div className="kpi-sub">{wallets.length} Konten</div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3>Jahresübersicht</h3>
          <div className="chart-legend">
            <div className="legend-item"><div className="legend-dot green" />Einnahmen</div>
            <div className="legend-item"><div className="legend-dot red" />Ausgaben</div>
          </div>
        </div>
        <MiniBarChart years={years} getTotalIncomeForYear={getTotalIncomeForYear} getTotalExpensesForYear={getTotalExpensesForYear} />
      </div>

      {goalsProgress.length > 0 && (
        <div className="chart-card">
          <div className="chart-header">
            <h3>🎯 Sparziele</h3>
            <button className="year-add-btn" onClick={() => onNavigate("goals")}>Alle anzeigen →</button>
          </div>
          {goalsProgress.map(g => {
            const pct = Math.min(100, Math.round(((g.currentAmount || 0) / g.targetAmount) * 100));
            return (
              <div key={g.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  <span>{g.emoji || "🎯"} {g.name}</span>
                  <span style={{ color: "var(--text-muted)" }}>{pct}%</span>
                </div>
                <div className="goal-progress-bar">
                  <div className="goal-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {wallets.length > 0 && (
        <div className="section-header"><h3>Konten & Töpfe</h3></div>
      )}
      <div className="wallet-list">
        {wallets.slice(0, 4).map(w => (
          <div key={w.id} className="wallet-item">
            <div className="wallet-icon-wrap">{({ ETF: "📈", Tagesgeld: "🏦", Girokonto: "💳", Kryptowährung: "₿", Bargeld: "💵", Sparbuch: "🏧" }[w.type]) || "💰"}</div>
            <div className="wallet-info">
              <div className="wallet-name">{w.name}</div>
              <div className="wallet-type">{w.type}</div>
            </div>
            <div className="wallet-amount">{safeNum(w.amount).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</div>
          </div>
        ))}
      </div>

      <div className="recent-section">
        <div className="section-header"><h3>Letzte Transaktionen</h3></div>
        {recentTx.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <p>Noch keine Einträge</p>
            <p className="empty-sub">Füge deinen ersten Eintrag hinzu</p>
          </div>
        ) : recentTx.map(tx => (
          <div key={tx.id} className="transaction-item">
            <div className={`tx-icon-wrap ${tx._type}`}>{tx._type === "income" ? "↑" : "↓"}</div>
            <div className="tx-info">
              <div className="tx-name">{tx.name || tx.category}</div>
              <div className="tx-date">{tx.date} · {tx.category}</div>
            </div>
            <div className={`tx-amount ${tx._type}`}>
              {tx._type === "income" ? "+" : "−"}{safeNum(tx.netAmount ?? tx.amount).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
