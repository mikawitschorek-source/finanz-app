import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { id:"dashboard", label:"Übersicht",  icon:"📊" },
  { id:"income",    label:"Einnahmen",  icon:"💰" },
  { id:"expenses",  label:"Ausgaben",   icon:"💸" },
  { id:"analytics", label:"Analyse",    icon:"📈" },
  { id:"wallets",   label:"Wallets",    icon:"🏦" },
];

function Logo({ size = 36 }) {
  return (
    <img
      src="/finanz-app/icon-192.png"
      alt="FinanzPlanner"
      width={size} height={size}
      style={{ width: size, height: size, objectFit: "cover", borderRadius: "22%" }}
    />
  );
}

export default function Navigation({ currentPage, setCurrentPage, onAddClick, onLock }) {
  const { user, logout } = useAuth();
  const initials = user?.email?.slice(0,2).toUpperCase() || "MK";

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Logo size={36} />
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">FinanzPlanner</span>
          </div>
        </div>

        <button className="sidebar-add-btn" onClick={onAddClick}>
          <span style={{fontSize:18}}>＋</span> Eintrag hinzufügen
        </button>

        <span className="sidebar-section-label">Übersicht</span>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              className={`sidebar-item ${currentPage===item.id?"active":""}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <span className="user-name">{user?.email?.split("@")[0]}</span>
            <button className="lock-btn"   onClick={onLock}  title="App sperren">🔒</button>
            <button className="logout-btn" onClick={logout}  title="Abmelden">↩</button>
          </div>
        </div>
      </aside>

      <header className="mobile-header">
        <div className="mobile-logo">
          <Logo size={32} />
          <span>FinanzPlanner</span>
        </div>
        <div className="header-right">
          <button className="lock-btn-mobile" onClick={onLock} title="Sperren">🔒</button>
          <div className="user-avatar" style={{width:28,height:28,fontSize:11}}>{initials}</div>
          <button className="logout-mobile" onClick={logout} title="Abmelden">↩</button>
        </div>
      </header>

      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => (
          <button key={item.id}
            className={`bottom-nav-item ${currentPage===item.id?"active":""}`}
            onClick={() => setCurrentPage(item.id)}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <button className="fab" onClick={onAddClick} aria-label="Eintrag hinzufügen">＋</button>
    </>
  );
}
