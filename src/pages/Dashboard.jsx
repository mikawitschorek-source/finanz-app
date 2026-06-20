import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { useYear } from "../context/YearContext";
import { useAuth } from "../context/AuthContext";
import YearSwitcher from "../components/YearSwitcher";

const safeNum = (v) => parseFloat(v) || 0;
const fmt = (n, showSign=false) => {
  const num = safeNum(n);
  const f = Math.abs(num).toLocaleString("de-DE", { style:"currency", currency:"EUR" });
  if (showSign && num > 0) return "+" + f;
  if (num < 0) return "−" + f;
  return f;
};

function MiniBarChart({ years, getTotalIncomeForYear, getTotalExpensesForYear }) {
  if (years.length === 0) return null;
  const data = years.slice(-7).map(y => ({ y, inc: getTotalIncomeForYear(y), exp: getTotalExpensesForYear(y) }));
  const max = Math.max(...data.flatMap(d=>[d.inc, d.exp]), 1);
  const now = new Date().getFullYear();
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Einnahmen vs. Ausgaben</h3>
        <div className="chart-legend">
          <span className="legend-item"><span className="legend-dot green"></span>Einnahmen</span>
          <span className="legend-item"><span className="legend-dot red"></span>Ausgaben</span>
        </div>
      </div>
      <div className="bar-chart">
        {data.map(d => (
          <div key={d.y} className={`bar-group ${d.y===now?"current":""}`}>
            <div className="bars">
              <div className="bar bar-income" style={{height:`${Math.round((d.inc/max)*100)}%`}} title={`Einnahmen: ${fmt(d.inc)}`}></div>
              <div className="bar bar-expense" style={{height:`${Math.round((d.exp/max)*100)}%`}} title={`Ausgaben: ${fmt(d.exp)}`}></div>
            </div>
            <span className="bar-label">{d.y}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { wallets, income, expenses, getTotalIncomeForYear, getTotalExpensesForYear } = useData();
  const { selectedYear, isAllYears, years } = useYear();
  const { user } = useAuth();

  const name = user?.email?.split("@")[0] || "Mika";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Guten Morgen" : hour < 17 ? "Hallo" : "Guten Abend";
  const today = new Date().toLocaleDateString("de-DE", { weekday:"long", day:"numeric", month:"long" });

  const displayYears = isAllYears ? years : [selectedYear];
  const totalIncome   = displayYears.reduce((s,y) => s + getTotalIncomeForYear(y), 0);
  const totalExpenses = displayYears.reduce((s,y) => s + getTotalExpensesForYear(y), 0);
  const totalWallet   = wallets.reduce((s,w) => s + safeNum(w.amount), 0);
  const balance       = totalIncome - totalExpenses;

  const recent = useMemo(() => {
    const all = [
      ...income.map(i=>({...i, txType:"income"})),
      ...expenses.map(e=>({...e, txType:"expense"})),
    ].sort((a,b)=>new Date(b.date)-new Date(a.date));
    return all.slice(0, 5);
  }, [income, expenses]);

  return (
    <div className="page">
      <div className="dashboard-header">
        <div>
          <h2 className="greeting">{greeting}, {name} 👋</h2>
          <p className="date-label">{today}</p>
        </div>
      </div>
      <YearSwitcher />
      <div className="kpi-grid">
        <div className="kpi-card kpi-primary"><div className="kpi-glow"></div><div className="kpi-label">💳 Wallet-Stand</div><div className="kpi-value">{fmt(totalWallet)}</div><div className="kpi-sub">{wallets.length} Wallet{wallets.length!==1?"s":""}</div></div>
        <div className="kpi-card kpi-green"><div className="kpi-glow"></div><div className="kpi-label">📥 Einnahmen</div><div className="kpi-value">{fmt(totalIncome)}</div><div className="kpi-sub">{isAllYears?"Gesamt":selectedYear}</div></div>
        <div className="kpi-card kpi-red"><div className="kpi-glow"></div><div className="kpi-label">📤 Ausgaben</div><div className="kpi-value">{fmt(totalExpenses)}</div><div className="kpi-sub">{isAllYears?"Gesamt":selectedYear}</div></div>
        <div className={`kpi-card ${balance>=0?"kpi-green":"kpi-red"}`}><div className="kpi-glow"></div><div className="kpi-label">📊 Bilanz</div><div className="kpi-value">{fmt(balance, true)}</div><div className="kpi-sub">{isAllYears?"Gesamt":selectedYear}</div></div>
      </div>
      <MiniBarChart years={years} getTotalIncomeForYear={getTotalIncomeForYear} getTotalExpensesForYear={getTotalExpensesForYear} />
      {wallets.length > 0 && (
        <div className="section-header">
          <h3>💳 Wallets</h3>
          <div className="wallet-list" style={{marginTop:8}}>
            {wallets.map(w => (
              <div key={w.id} className="wallet-item">
                <div className="wallet-icon-wrap">{w.icon||"💰"}</div>
                <div className="wallet-info"><div className="wallet-name">{w.name}</div><div className="wallet-type">{w.type}</div></div>
                <div className="wallet-amount" style={{color:safeNum(w.amount)>=0?"var(--text)":"var(--red)"}}>{fmt(w.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="recent-section">
        <div className="section-header" style={{marginBottom:10}}><h3>🕐 Letzte Einträge</h3></div>
        {recent.length === 0 ? (
          <div className="empty-state" style={{padding:"30px 0"}}>
            <div className="empty-icon">📋</div>
            <p>Noch keine Einträge</p>
            <p className="empty-sub">Füge deinen ersten Eintrag hinzu</p>
          </div>
        ) : recent.map(tx => (
          <div key={tx.id} className="transaction-item">
            <div className={`tx-icon-wrap ${tx.txType}`}>{tx.txType==="income"?"↑":"↓"}</div>
            <div className="tx-info">
              <div className="tx-name">{tx.name || tx.category}</div>
              <div className="tx-date">{tx.date} · {tx.category}</div>
            </div>
            <div className={`tx-amount ${tx.txType}`}>{tx.txType==="income"?"+":"−"}{fmt(safeNum(tx.netAmount??tx.amount))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
