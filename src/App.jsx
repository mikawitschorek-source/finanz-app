import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Wallets from "./pages/Wallets";
import Navigation from "./components/Navigation";
import AddTransaction from "./components/AddTransaction";
import LockScreen, { useLockScreen } from "./components/LockScreen";

export default function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showAdd, setShowAdd] = useState(false);
  const { locked, unlock, lock } = useLockScreen();

  if (loading) return (
    <div className="splash"><div className="spinner" /></div>
  );

  if (!user) return <Login />;

  // App gesperrt
  if (locked) return <LockScreen onUnlock={unlock} />;

  const pages = { dashboard: Dashboard, income: Income, expenses: Expenses, analytics: Analytics, wallets: Wallets };
  const Page = pages[currentPage] || Dashboard;

  return (
    <div className="app-layout">
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onAddClick={() => setShowAdd(true)}
        onLock={lock}
      />
      <main className="main-content">
        <Page />
      </main>
      {showAdd && <AddTransaction onClose={() => setShowAdd(false)} />}
    </div>
  );
}
