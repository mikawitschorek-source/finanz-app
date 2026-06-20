/**
 * LockScreen.jsx
 *
 * PC:    Nur PIN (kein Biometrie-Button). Setup = nur PIN festlegen.
 * Handy: PIN festlegen → Biometrie registrieren → danach Fingerabdruck/FaceID.
 *
 * Setup wird IMMER erzwungen beim ersten Login (egal ob PC oder Handy).
 */

import { useState, useEffect, useCallback } from "react";

const PIN_KEY   = "fp_lock_pin_hash";
const CRED_KEY  = "fp_lock_cred_id";
const SETUP_KEY = "fp_lock_setup_done";
const USER_ID   = new Uint8Array([1,2,3,4,5,6,7,8]);
const TIMEOUT_MS = 5 * 60 * 1000;

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

function toBase64(u8) { return btoa(String.fromCharCode(...u8)); }
function fromBase64(s) { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }

async function checkBiometryAvailable() {
  if (!window.PublicKeyCredential) return false;
  try { return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); }
  catch { return false; }
}

async function registerBiometry() {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "FinanzPlanner", id: window.location.hostname },
      user: { id: USER_ID, name: "user@finanzplanner", displayName: "FinanzPlanner" },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
    }
  });
  localStorage.setItem(CRED_KEY, toBase64(new Uint8Array(cred.rawId)));
}

async function verifyBiometry() {
  const credIdStr = localStorage.getItem(CRED_KEY);
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  const opts = {
    publicKey: {
      challenge, timeout: 60000, userVerification: "required",
      rpId: window.location.hostname,
      allowCredentials: credIdStr
        ? [{ type: "public-key", id: fromBase64(credIdStr), transports: ["internal"] }]
        : [],
    }
  };
  await navigator.credentials.get(opts);
}

// ── Auto-Lock Hook ──────────────────────────────────────────────
export function useLockScreen() {
  const setupDone = !!localStorage.getItem(SETUP_KEY);
  // IMMER sperren: ob Setup noch aussteht oder bereits eingerichtet
  const [locked, setLocked] = useState(true);
  const lock   = useCallback(() => setLocked(true),  []);
  const unlock = useCallback(() => setLocked(false), []);

  // Auto-Lock nach 5 Min Inaktivität (nur wenn bereits eingerichtet)
  useEffect(() => {
    if (locked || !setupDone) return;
    let timer = setTimeout(() => setLocked(true), TIMEOUT_MS);
    const reset = () => { clearTimeout(timer); timer = setTimeout(() => setLocked(true), TIMEOUT_MS); };
    const evts = ["mousemove","keydown","touchstart","click","scroll"];
    evts.forEach(e => window.addEventListener(e, reset));
    return () => { clearTimeout(timer); evts.forEach(e => window.removeEventListener(e, reset)); };
  }, [locked, setupDone]);

  return { locked, lock, unlock };
}

// ── Haupt-Komponente ───────────────────────────────────────────
export default function LockScreen({ onUnlock }) {
  const setupDone = !!localStorage.getItem(SETUP_KEY);
  const [mode, setMode]               = useState(setupDone ? "unlock" : "setup-pin");
  const [hasBiometry, setHasBiometry] = useState(false);
  const [pin, setPin]                 = useState("");
  const [pinConfirm, setPinC]         = useState("");
  const [pinInput, setPinInput]       = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [usePinFallback, setUsePinFallback] = useState(false);

  useEffect(() => { checkBiometryAvailable().then(setHasBiometry); }, []);

  // ── Setup Schritt 1: PIN festlegen ──
  async function onSetupPin(e) {
    e.preventDefault();
    if (pin.length < 4) { setError("Mindestens 4 Stellen."); return; }
    setError(""); setMode("setup-pin-confirm");
  }

  // ── Setup Schritt 2: PIN bestätigen ──
  async function onSetupPinConfirm(e) {
    e.preventDefault();
    if (pinConfirm !== pin) { setError("PINs stimmen nicht überein."); setPinC(""); return; }
    const hash = await sha256(pin);
    localStorage.setItem(PIN_KEY, hash);
    setError("");
    // Handy mit Biometrie → Schritt 3, sonst fertig
    if (hasBiometry) {
      setMode("setup-biometry");
    } else {
      localStorage.setItem(SETUP_KEY, "1");
      onUnlock();
    }
  }

  // ── Setup Schritt 3: Biometrie registrieren (nur Handy) ──
  async function onSetupBiometry() {
    setLoading(true); setError("");
    try {
      await registerBiometry();
      localStorage.setItem(SETUP_KEY, "1");
      onUnlock();
    } catch (e) {
      if (e.name === "NotAllowedError") {
        setError("Scan abgebrochen — bitte nochmal tippen.");
      } else {
        setError("Fehler: " + e.message);
      }
    }
    setLoading(false);
  }

  function skipBiometry() {
    localStorage.setItem(SETUP_KEY, "1");
    onUnlock();
  }

  // ── Entsperren: Biometrie ──
  async function onBiometryUnlock() {
    setLoading(true); setError("");
    try {
      await verifyBiometry();
      onUnlock();
    } catch (e) {
      setError("Scan fehlgeschlagen — bitte PIN verwenden.");
      setUsePinFallback(true);
    }
    setLoading(false);
  }

  // ── Entsperren: PIN ──
  async function onPinUnlock(e) {
    e.preventDefault();
    setLoading(true); setError("");
    const stored = localStorage.getItem(PIN_KEY);
    if (!stored) {
      // Sollte nicht passieren, aber als Sicherheitsnetz:
      setError("Kein PIN gespeichert. Bitte neu einrichten.");
      localStorage.clear();
      window.location.reload();
      return;
    }
    const hash = await sha256(pinInput);
    if (hash === stored) {
      onUnlock();
    } else {
      setError("Falscher PIN.");
      setPinInput("");
    }
    setLoading(false);
  }

  return (
    <div className="lock-screen">
      <div className="lock-card">

        {/* ── Setup: PIN ── */}
        {mode === "setup-pin" && (
          <>
            <div className="lock-icon">🔑</div>
            <h2>PIN festlegen</h2>
            <p className="lock-sub lock-center">
              {hasBiometry
                ? "Dient als Fallback falls Fingerabdruck / Face ID fehlschlägt."
                : "Zum Entsperren der App auf diesem Gerät."}
            </p>
            <form onSubmit={onSetupPin} className="lock-form">
              <PinInput value={pin} onChange={setPin} autoFocus />
              {error && <p className="lock-error">{error}</p>}
              <button type="submit" className="btn-primary">Weiter →</button>
            </form>
          </>
        )}

        {/* ── Setup: PIN bestätigen ── */}
        {mode === "setup-pin-confirm" && (
          <>
            <div className="lock-icon">✅</div>
            <h2>PIN bestätigen</h2>
            <form onSubmit={onSetupPinConfirm} className="lock-form">
              <PinInput value={pinConfirm} onChange={setPinC} autoFocus />
              {error && <p className="lock-error">{error}</p>}
              <button type="submit" className="btn-primary">Bestätigen</button>
              <button type="button" className="lock-back-btn"
                onClick={() => { setMode("setup-pin"); setPinC(""); setError(""); }}>
                ← Zurück
              </button>
            </form>
          </>
        )}

        {/* ── Setup: Biometrie (nur Handy) ── */}
        {mode === "setup-biometry" && (
          <>
            <div className="lock-icon">👆</div>
            <h2>Fingerabdruck / Face ID</h2>
            <p className="lock-sub lock-center">
              Dein Handy fragt gleich nach Fingerabdruck oder Gesichtsscan.
            </p>
            {error && <p className="lock-error">{error}</p>}
            <button className="btn-biometry" onClick={onSetupBiometry} disabled={loading}>
              {loading ? "Warte auf Scan…" : "👆  Jetzt einrichten"}
            </button>
            <button className="lock-back-btn" onClick={skipBiometry}>
              Überspringen — nur PIN verwenden
            </button>
          </>
        )}

        {/* ── Entsperren ── */}
        {mode === "unlock" && (
          <>
            <div className="lock-icon">🔒</div>
            <h2>FinanzPlanner</h2>

            {/* Biometrie-Button nur auf Handy */}
            {hasBiometry && !usePinFallback && (
              <>
                <button className="btn-biometry" onClick={onBiometryUnlock} disabled={loading}>
                  {loading ? "Warte auf Scan…" : "👆  Fingerabdruck / Face ID"}
                </button>
                {error && <p className="lock-error">{error}</p>}
                <button className="lock-back-btn"
                  onClick={() => { setUsePinFallback(true); setError(""); }}>
                  PIN verwenden
                </button>
              </>
            )}

            {/* PIN — auf PC immer, auf Handy als Fallback */}
            {(!hasBiometry || usePinFallback) && (
              <>
                <form onSubmit={onPinUnlock} className="lock-form">
                  <p className="lock-sub" style={{marginBottom:8,textAlign:"center"}}>PIN eingeben</p>
                  <PinInput value={pinInput} onChange={setPinInput} autoFocus />
                  {error && <p className="lock-error">{error}</p>}
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "…" : "Entsperren"}
                  </button>
                </form>
                {hasBiometry && (
                  <button className="lock-back-btn"
                    onClick={() => { setUsePinFallback(false); setError(""); setPinInput(""); }}>
                    ← Biometrie verwenden
                  </button>
                )}
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}

function PinInput({ value, onChange, autoFocus }) {
  return (
    <input
      type="password"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
      placeholder="• • • •"
      maxLength={8}
      autoFocus={autoFocus}
      autoComplete="off"
      className="pin-input"
    />
  );
}
