import { useData } from "../context/DataContext";

const NAV_ITEMS = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "income", icon: "💰", label: "Einnahmen" },
  { id: "expenses", icon: "💸", label: "Ausgaben" },
  { id: "wallets", icon: "🏦", label: "Konten" },
  { id: "goals", icon: "🎯", label: "Sparziele" },
  { id: "budget", icon: "📊", label: "Budget" },
  { id: "analytics", icon: "📈", label: "Analyse" },
];

export default function Navigation({ currentPage, onNavigate, onAdd, onLock }) {
  const { expenses, budgets } = useData();
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthExpenses = expenses.filter((e) => e.date?.startsWith(thisMonth));

  const overBudgetCount = budgets.filter((b) => {
    const spent = monthExpenses
      .filter((e) => e.category === b.category)
      .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    return spent > b.amount;
  }).length;

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/icon-1024.jpg" alt="Logo" width="32" height="32" style={{ borderRadius: "8px" }} />
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">FinanzPlaner</span>
            <span className="sidebar-logo-sub">Personal Finance</span>
          </div>
        </div>

        <div className="sidebar-section-label">Menü</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${currentPage === item.id ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.id === "budget" && overBudgetCount > 0 && (
                <span className="sidebar-badge">{overBudgetCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-add-btn" onClick={onAdd}>
            <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span> Eintrag hinzufügen
          </button>
          <div className="sidebar-user">
            <div className="sidebar-lock-row">
              <button className="lock-btn" onClick={onLock} title="App sperren">
                🔒 Sperren
              </button>
            </div>
          </div>
        </div>
      </aside>

      <header className="mobile-header">
        <div className="mobile-logo">
          <img src="/icon-1024.jpg" alt="Logo" width="26" height="26" style={{ borderRadius: "6px" }} />
          FinanzPlaner
        </div>
        <div className="header-right">
          <button className="lock-btn-mobile" onClick={onLock}>
            🔒
          </button>
        </div>
      </header>

      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`bottom-nav-item ${currentPage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
            {item.id === "budget" && overBudgetCount > 0 && (
              <span className="bottom-badge">{overBudgetCount}</span>
            )}
          </button>
        ))}
      </nav>

      <button className="fab" onClick={onAdd}>
        +
      </button>
    </>
  );
}