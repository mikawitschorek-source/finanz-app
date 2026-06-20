import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Login() {
  const { login, register, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (isLogin) await login(email, password);
      else await register(email, password);
    } catch (err) {
      const msgs = {
        "auth/user-not-found": "Kein Konto mit dieser E-Mail gefunden.",
        "auth/wrong-password": "Falsches Passwort.",
        "auth/email-already-in-use": "Diese E-Mail ist bereits registriert.",
        "auth/weak-password": "Passwort muss mindestens 6 Zeichen haben.",
        "auth/invalid-email": "Ungültige E-Mail-Adresse.",
        "auth/invalid-credential": "E-Mail oder Passwort falsch.",
      };
      setError(msgs[err.code] || err.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try { await loginWithGoogle(); }
    catch (err) { setError("Google-Login fehlgeschlagen. Bitte erneut versuchen."); }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-row">
          <Logo size={36} />
          <div>
            <p className="login-logo-text">FinanzPlanner</p>
            <p className="login-logo-sub">Professionelle Finanzplanung</p>
          </div>
        </div>

        <h1>{isLogin ? "Willkommen zurück" : "Konto erstellen"}</h1>
        <p className="login-sub">{isLogin ? "Melde dich an um fortzufahren" : "Starte deine Finanzplanung"}</p>

        <button className="btn-google" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Mit Google anmelden
        </button>

        <div className="divider">oder</div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>E-Mail</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="deine@email.de" required />
          </div>
          <div className="input-group">
            <label>Passwort</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mindestens 6 Zeichen" required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Bitte warten…" : (isLogin ? "Anmelden" : "Registrieren")}
          </button>
        </form>

        <div className="toggle-auth">
          {isLogin ? "Noch kein Konto?" : "Schon registriert?"}{" "}
          <button onClick={()=>{setIsLogin(!isLogin);setError("");}}>
            {isLogin ? "Registrieren" : "Anmelden"}
          </button>
        </div>
      </div>
    </div>
  );
}
