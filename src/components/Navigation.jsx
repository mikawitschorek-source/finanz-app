import { useData } from "../context/DataContext";

const NAV_ITEMS = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "income",    icon: "💰", label: "Einnahmen" },
  { id: "expenses",  icon: "💸", label: "Ausgaben"  },
  { id: "wallets",   icon: "🏦", label: "Konten"    },
  { id: "goals",     icon: "🎯", label: "Sparziele" },
  { id: "budget",    icon: "📊", label: "Budget"    },
  { id: "analytics", icon: "📈", label: "Analyse"   },
];

export default function Navigation({ currentPage, onNavigate, onAdd, onLock }) {
  const { expenses, budgets } = useData();
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const monthExpenses = expenses.filter(e => e.date?.startsWith(thisMonth));

  const overBudgetCount = budgets.filter(b => {
    const spent = monthExpenses.filter(e => e.category === b.category).reduce((s,e) => s+(parseFloat(e.amount)||0), 0);
    return spent > b.amount;
  }).length;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#2563eb"/>
            <path d="M7 14h14M14 7v14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="4" fill="none" stroke="white" strokeWidth="1.5"/>
          </svg>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">FinanzPlaner</span>
            <span className="sidebar-logo-sub">Personal Finance</span>
          </div>
        </div>

        <div className="sidebar-section-label">Menü</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id} className={`sidebar-item ${currentPage === item.id ? "active" : ""}`} onClick={() => onNavigate(item.id)}>
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
            <span style={{fontSize:"18px",lineHeight:1}}>+</span> Eintrag hinzufügen
          </button>
          <div className="sidebar-user">
            <div className="sidebar-lock-row">
              <button className="lock-btn" onClick={onLock} title="App sperren">🔒 Sperren</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-logo">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#2563eb"/>
            <path d="M7 14h14M14 7v14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          FinanzPlaner
        </div>
        <div className="header-right">
          <button className="lock-btn-mobile" onClick={onLock}>🔒</button>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => (
          <button key={item.id} className={`bottom-nav-item ${currentPage === item.id ? "active" : ""}`} onClick={() => onNavigate(item.id)}>
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
            {item.id === "budget" && overBudgetCount > 0 && (
              <span className="bottom-badge">{overBudgetCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Mobile FAB */}
      <button className="fab" onClick={onAdd}>+</button>
    </>
  );
}
