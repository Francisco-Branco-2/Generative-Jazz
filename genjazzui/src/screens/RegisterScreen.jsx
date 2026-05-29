import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./LoginScreen.css";
import "./RegisterScreen.css";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Palavra-passe deve ter mínimo 8 caracteres."); return; }
    if (password !== confirm) { setError("As palavras-passe não coincidem."); return; }
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
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
        <h2 className="auth-card__title">Criar Conta</h2>
        <p className="auth-card__sub">Regista-te para começar a criar</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-field__label">Nome</label>
            <input className="auth-field__input" type="text" autoComplete="name"
              value={name} onChange={e => setName(e.target.value)}
              placeholder="O seu nome" required />
          </div>
          <div className="auth-field">
            <label className="auth-field__label">E-mail</label>
            <input className="auth-field__input" type="email" autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@exemplo.com" required />
          </div>
          <div className="auth-field">
            <label className="auth-field__label">Palavra-passe</label>
            <input className="auth-field__input" type="password" autoComplete="new-password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres" required />
          </div>
          <div className="auth-field">
            <label className="auth-field__label">Confirmar Palavra-passe</label>
            <input className="auth-field__input" type="password" autoComplete="new-password"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Repete a palavra-passe" required />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Criar Conta"}
          </button>
        </form>
        <p className="auth-switch">
          Já tem conta?{" "}
          <Link to="/login" className="auth-switch__link">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
