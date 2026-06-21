import { useState } from "react";
import { useData } from "../context/DataContext";

const WALLET_TYPES = ["Girokonto","Tagesgeld","ETF","Sparbuch","Kryptowährung","Bargeld","Sonstiges"];
const WALLET_ICONS = { ETF:"📈", Tagesgeld:"🏦", Girokonto:"💳", Kryptowährung:"₿", Bargeld:"💵", Sparbuch:"🏧", Sonstiges:"💰" };

export default function Wallets() {
  const { wallets, addWallet, updateWallet, deleteWallet } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", type: "Girokonto", amount: "" });

  const totalWealth = wallets.reduce((s, w) => s + (parseFloat(w.amount) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.amount === "") return;
    const data = { name: form.name, type: form.type, amount: parseFloat(form.amount), updatedAt: new Date().toISOString() };
    if (editId) { await updateWallet(editId, data); setEditId(null); }
    else await addWallet(data);
    setForm({ name: "", type: "Girokonto", amount: "" });
    setShowForm(false);
  };

  const startEdit = (w) => {
    setEditId(w.id);
    setForm({ name: w.name, type: w.type, amount: String(w.amount || "") });
    setShowForm(true);
  };

  const isEndOfMonth = new Date().getDate() >= 25;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Konten & Töpfe</h2>
          <p className="page-sub">{wallets.length} Konten & Töpfe</p>
        </div>
        <button className="add-wallet-btn" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name:"", type:"Girokonto", amount:"" }); }}>
          {showForm ? "✕ Abbrechen" : "+ Konto hinzufügen"}
        </button>
      </div>

      {isEndOfMonth && !showForm && (
        <div className="reminder-banner">
          📅 <span>Monatsende — Zeit, deine Konten zu aktualisieren!</span>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ background:"var(--surface)", borderRadius:"var(--radius-lg)", padding:20, border:"1px solid var(--border)", marginBottom:16, animation:"scaleIn var(--t-mid) var(--ease)" }}>
          <div style={{ fontWeight:800, fontSize:14, marginBottom:14 }}>{editId ? "Konto bearbeiten" : "Neues Konto / Topf"}</div>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="z.B. DKB Girokonto" required />
            </div>
            <div className="input-group">
              <label>Typ</label>
              <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                {WALLET_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Aktueller Stand (€)</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" required />
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:12 }}>
              <button type="button" className="btn-cancel" onClick={() => { setShowForm(false); setEditId(null); }}>Abbrechen</button>
              <button type="submit" className="btn-primary-sm">{editId ? "Speichern" : "Erstellen"}</button>
            </div>
          </form>
        </div>
      )}

      {wallets.length === 0 && !showForm ? (
        <div className="empty-state">
          <div className="empty-icon">🏦</div>
          <p>Noch keine Konten eingetragen</p>
          <p className="empty-sub">Trage deine Konten, ETFs und Töpfe ein um dein Gesamtvermögen zu sehen</p>
        </div>
      ) : (
        <>
          {wallets.length > 0 && (
            <div className="chart-card" style={{ marginBottom:16 }}>
              <div className="analytics-label">Gesamtvermögen</div>
              <div className="analytics-value blue">{totalWealth.toLocaleString("de-DE",{style:"currency",currency:"EUR"})}</div>
            </div>
          )}
          <div className="wallet-cards">
            {wallets.map(w => (
              <div key={w.id} className="wallet-card">
                <div className="wallet-card-top">
                  <span className="wallet-card-emoji">{WALLET_ICONS[w.type] || "💰"}</span>
                  <div className="wallet-card-actions">
                    <button className="icon-btn" onClick={() => startEdit(w)}>✏️</button>
                    <button className="icon-btn" onClick={() => window.confirm("Konto löschen?") && deleteWallet(w.id)}>🗑️</button>
                  </div>
                </div>
                <div className="wallet-card-amount">{(parseFloat(w.amount)||0).toLocaleString("de-DE",{style:"currency",currency:"EUR"})}</div>
                <div className="wallet-card-name">{w.name}</div>
                <div className="wallet-card-type">{w.type}</div>
                {w.updatedAt && <div className="wallet-card-updated">Aktualisiert: {new Date(w.updatedAt).toLocaleDateString("de-DE")}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
