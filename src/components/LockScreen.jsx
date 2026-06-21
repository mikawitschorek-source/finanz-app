import { useState } from "react";

const LOCK_PIN = "1234"; // Standard-PIN – in deiner echten App aus env oder user settings

export function useLockScreen() {
  const [locked, setLocked] = useState(false);
  return {
    locked,
    lock: () => setLocked(true),
    unlock: () => setLocked(false),
  };
}

export default function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === LOCK_PIN) {
      setError("");
      onUnlock();
    } else {
      setError("Falscher PIN. Bitte erneut versuchen.");
      setPin("");
    }
  };

  return (
    <div className="lock-screen">
      <div className="lock-card">
        <div className="lock-icon">🔒</div>
        <h2>App gesperrt</h2>
        <p className="lock-sub lock-center">Gib deinen PIN ein um fortzufahren</p>
        <div className="lock-info-box">Standard-PIN: 1234</div>
        <form className="lock-form" onSubmit={handleSubmit}>
          <input
            className="pin-input"
            type="password"
            maxLength={6}
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="••••"
            autoFocus
          />
          {error && <p className="lock-error">{error}</p>}
          <button type="submit" className="btn-primary">Entsperren</button>
        </form>
      </div>
    </div>
  );
}
