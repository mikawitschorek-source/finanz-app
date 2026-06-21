import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Wallets from "./pages/Wallets";
import Goals from "./pages/Goals";
import Budget from "./pages/Budget";
import Navigation from "./components/Navigation";
import AddTransaction from "./components/AddTransaction";
import LockScreen, { useLockScreen } from "./components/LockScreen";

export default function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showAdd, setShowAdd] = useState(false);
  const { locked, unlock, lock } = useLockScreen();

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100dvh" }}>
      <div className="spinner" />
    </div>
  );

  if (!user) return <Login />;
  if (locked) return <LockScreen onUnlock={unlock} />;

  const pages = { dashboard: <Dashboard onNavigate={setCurrentPage} />, income: <Income />, expenses: <Expenses />, analytics: <Analytics />, wallets: <Wallets />, goals: <Goals />, budget: <Budget /> };

  return (
    <div className="app-layout">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} onAdd={() => setShowAdd(true)} onLock={lock} />
      <main className="main-content">
        {pages[currentPage] || <Dashboard onNavigate={setCurrentPage} />}
      </main>
      {showAdd && <AddTransaction onClose={() => setShowAdd(false)} />}
    </div>
  );
}
