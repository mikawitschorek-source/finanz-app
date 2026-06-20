import { useState } from "react";
import { useData } from "../context/DataContext";

const WALLET_TYPES = ["Girokonto","Tagesgeld","ETF","Sparbuch","Kryptowährung","Bargeld","Sonstiges"];
const WALLET_ICONS = { "ETF":"📈","Tagesgeld":"🏦","Girokonto":"💳","Kryptowährung":"₿","Bargeld":"💵","Sparbuch":"🏧","Sonstiges":"💰" };

export default function Wallets() {
  const { wallets, addWallet, updateWallet, deleteWallet } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name:"", type:"Girokonto", amount:"" });

  const totalWealth = wallets.reduce((s,w) => s + (w.amount||0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.amount === "") return;
    const data = { name: form.name, type: form.type, amount: parseFloat(form.amount), updatedAt: new Date().toISOString() };
    if (editId) { await updateWallet(editId, data); setEditId(null); }
    else await addWallet(data);
    setForm({ name:"", type:"Girokonto", amount:"" });
    setShowForm(false);
  };

  const startEdit = (w) => {
    setEditId(w.id); setForm({ name:w.name, type:w.type, amount:String(w.amount||"") }); setShowForm(true);
  };
  const cancelEdit = () => { setEditId(null); setForm({name:"",type:"Girokonto",amount:""}); setShowForm(false); };

  // Check monthly reminder (last day of month)
  const today = new Date();
  const isEndOfMonth = today.getDate() >= 25;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Geldtöpfe</h2>
          <p className="page-sub">{wallets.length} Konten & Töpfe</p>
        </div>
        {!showForm && (
          <button className="add-wallet-btn" onClick={() => setShowForm(true)}>+ Hinzufügen</button>
        )}
      </div>

      {isEndOfMonth && wallets.length > 0 && (
        <div className="reminder-banner">
          <span style={{fontSize:18}}>🔔</span>
          <div>
            <strong>Monatliche Erinnerung</strong> — Bitte aktualisiere deine Kontostände für {today.toLocaleString("de-DE",{month:"long"})}.
            Die Werte sollten deinen aktuellen Stand widerspiegeln.
          </div>
        </div>
      )}

      {showForm && (
        <div className="chart-card" style={{marginBottom:16}}>
          <p className="modal-title" style={{fontSize:15}}>{editId ? "Konto bearbeiten" : "Neues Konto / Topf"}</p>
          <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:10}}>
            <div className="input-group" style={{marginBottom:0}}>
              <label>Name</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="z.B. ING Girokonto" required />
            </div>
            <div className="input-group" style={{marginBottom:0}}>
              <label>Art</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                {WALLET_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="input-group" style={{marginBottom:0}}>
              <label>Aktueller Stand (€)</label>
              <input type="number" step="0.01" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" required />
            </div>
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <button type="submit" className="btn-primary" style={{width:"auto",flex:1,padding:"10px"}}>
                {editId ? "Speichern" : "Hinzufügen"}
              </button>
              <button type="button" onClick={cancelEdit} style={{padding:"10px 16px",border:"1px solid var(--border-md)",borderRadius:"var(--radius-md)",fontWeight:600,fontSize:13,color:"var(--text-muted)"}}>
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {wallets.length === 0 && !showForm ? (
        <div className="empty-state">
          <span className="empty-icon">🏦</span>
          <p>Noch keine Konten eingetragen</p>
          <p className="empty-sub">Trage deine Konten, ETFs und Töpfe ein um dein Gesamtvermögen zu sehen</p>
        </div>
      ) : (
        <>
          {wallets.length > 0 && (
            <div className="chart-card" style={{marginBottom:16}}>
              <p className="analytics-label">Gesamtvermögen</p>
              <p style={{fontSize:26,fontWeight:800,fontVariantNumeric:"tabular-nums",letterSpacing:"-0.5px"}}>
                {totalWealth.toLocaleString("de-DE",{style:"currency",currency:"EUR"})}
              </p>
            </div>
          )}
          <div className="wallet-cards">
            {wallets.map(w => (
              <div key={w.id} className="wallet-card">
                <div className="wallet-card-top">
                  <span className="wallet-card-emoji">{WALLET_ICONS[w.type]||"💰"}</span>
                  <div className="wallet-card-actions">
                    <button className="icon-btn" onClick={()=>startEdit(w)} title="Bearbeiten">✎</button>
                    <button className="icon-btn" onClick={()=>deleteWallet(w.id)} title="Löschen" style={{color:"var(--red)"}}>✕</button>
                  </div>
                </div>
                <p className="wallet-card-amount">{(w.amount||0).toLocaleString("de-DE",{style:"currency",currency:"EUR"})}</p>
                <p className="wallet-card-name">{w.name}</p>
                <p className="wallet-card-type">{w.type}</p>
                {w.updatedAt && <p className="wallet-card-updated">Aktualisiert: {new Date(w.updatedAt).toLocaleDateString("de-DE")}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
