import { useState } from "react";
import { useData } from "../context/DataContext";

export default function Goals() {
  const { goals, wallets, addGoal, updateGoal, deleteGoal } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", targetAmount: "", currentAmount: "", emoji: "🎯", deadline: "" });

  const totalWealth = wallets.reduce((s, w) => s + (parseFloat(w.amount) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.targetAmount) return;
    const data = {
      name: form.name,
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: parseFloat(form.currentAmount) || 0,
      emoji: form.emoji || "🎯",
      deadline: form.deadline || "",
    };
    if (editId) { await updateGoal(editId, data); setEditId(null); }
    else await addGoal(data);
    setForm({ name: "", targetAmount: "", currentAmount: "", emoji: "🎯", deadline: "" });
    setShowForm(false);
  };

  const startEdit = (g) => {
    setEditId(g.id);
    setForm({ name: g.name, targetAmount: String(g.targetAmount), currentAmount: String(g.currentAmount || 0), emoji: g.emoji || "🎯", deadline: g.deadline || "" });
    setShowForm(true);
  };

  const fmt = (n) => (parseFloat(n)||0).toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const emojis = ["🎯","🏖️","🚗","🏠","💻","✈️","💍","🎓","🏋️","📱","🎮","💰"];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Sparziele</h2>
          <p className="page-sub">{goals.length} Ziele · Vermögen: {fmt(totalWealth)}</p>
        </div>
        <button className="btn-add-goal" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name:"", targetAmount:"", currentAmount:"", emoji:"🎯", deadline:"" }); }}>
          {showForm ? "✕" : "+ Neues Ziel"}
        </button>
      </div>

      {showForm && (
        <form className="goal-form card" onSubmit={handleSubmit}>
          <div className="goal-form-title">{editId ? "Ziel bearbeiten" : "Neues Sparziel"}</div>
          <div className="emoji-picker">
            {emojis.map(em => (
              <button type="button" key={em} className={`emoji-btn ${form.emoji === em ? "active" : ""}`} onClick={() => setForm(f => ({...f, emoji: em}))}>{em}</button>
            ))}
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="z.B. Urlaub Japan" required />
            </div>
          </div>
          <div className="form-row two-col">
            <div className="input-group">
              <label>Zielbetrag (€)</label>
              <input type="number" value={form.targetAmount} onChange={e => setForm(f=>({...f,targetAmount:e.target.value}))} placeholder="2000" required min="1" />
            </div>
            <div className="input-group">
              <label>Bereits gespart (€)</label>
              <input type="number" value={form.currentAmount} onChange={e => setForm(f=>({...f,currentAmount:e.target.value}))} placeholder="0" min="0" />
            </div>
          </div>
          <div className="input-group">
            <label>Deadline (optional)</label>
            <input type="date" value={form.deadline} onChange={e => setForm(f=>({...f,deadline:e.target.value}))} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => { setShowForm(false); setEditId(null); }}>Abbrechen</button>
            <button type="submit" className="btn-primary-sm">{editId ? "Speichern" : "Erstellen"}</button>
          </div>
        </form>
      )}

      {goals.length === 0 && !showForm ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <p className="empty-title">Noch keine Sparziele</p>
          <p className="empty-hint">Setze dir Ziele und verfolge deinen Fortschritt</p>
          <button className="btn-primary-sm" onClick={() => setShowForm(true)}>Erstes Ziel erstellen</button>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map(g => {
            const pct = Math.min(100, Math.round(((g.currentAmount||0) / g.targetAmount) * 100));
            const remaining = g.targetAmount - (g.currentAmount||0);
            const done = pct >= 100;
            const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline) - new Date()) / 86400000) : null;
            return (
              <div key={g.id} className={`goal-card ${done ? "goal-done" : ""}`}>
                <div className="goal-header">
                  <span className="goal-emoji">{g.emoji || "🎯"}</span>
                  <div className="goal-info">
                    <div className="goal-name">{g.name}</div>
                    {g.deadline && <div className="goal-deadline">{daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} Tage noch` : "Abgelaufen") : ""}</div>}
                  </div>
                  <div className="goal-actions">
                    <button className="goal-edit-btn" onClick={() => startEdit(g)}>✏️</button>
                    <button className="goal-delete-btn" onClick={() => window.confirm("Ziel löschen?") && deleteGoal(g.id)}>🗑️</button>
                  </div>
                </div>
                <div className="goal-amounts">
                  <span className="goal-current">{fmt(g.currentAmount||0)}</span>
                  <span className="goal-target"> / {fmt(g.targetAmount)}</span>
                </div>
                <div className="goal-progress-bar">
                  <div className="goal-progress-fill" style={{ width: `${pct}%`, background: done ? "var(--green)" : "var(--primary)" }} />
                </div>
                <div className="goal-footer">
                  <span className="goal-pct">{pct}%</span>
                  {!done && <span className="goal-remaining">Noch {fmt(remaining)}</span>}
                  {done && <span className="goal-done-badge">✅ Erreicht!</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
