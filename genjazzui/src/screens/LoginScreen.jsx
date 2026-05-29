import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Icon from "../components/Icon";
import "./LoginScreen.css";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-logo">
        <span className="auth-logo__note">GJ</span>
      </div>
      <div className="auth-card">
        <h2 className="auth-card__title">Bem-vindo de volta</h2>
        <p className="auth-card__sub">Inicia sessão para continuar</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-field__label">E-mail</label>
            <input className="auth-field__input" type="email" autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@exemplo.com" required />
          </div>
          <div className="auth-field">
            <label className="auth-field__label">Palavra-passe</label>
            <div className="auth-field__pwd">
              <input className="auth-field__input" type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••" required />
              <button type="button" className="auth-field__eye"
                onClick={() => setShowPwd(v => !v)}>
                {showPwd ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>
          <button type="button" className="auth-forgot">Esqueceu a senha?</button>
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Entrar"}
          </button>
        </form>
        <p className="auth-switch">
          Não tem conta?{" "}
          <Link to="/register" className="auth-switch__link">Registar</Link>
        </p>
      </div>
    </div>
  );
}
