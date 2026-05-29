import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./TopBar.css";

function TopBar({ title, subtitle }) {
  const { email, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = email ? email[0].toUpperCase() : "?";

  function handleSignOut() {
    setMenuOpen(false);
    signOut();
    navigate("/sign-in");
  }

  return (
    <header className="top-bar">
      <div className="top-bar__brand">
        <span className="top-bar__logo">GJ</span>
        <div>
          <h1 className="top-bar__title">{title || "GenJazz"}</h1>
          {subtitle && <p className="top-bar__sub">{subtitle}</p>}
        </div>
      </div>

      <div className="top-bar__user">
        <button
          className="top-bar__avatar"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu do utilizador"
        >
          {initial}
        </button>

        {menuOpen && (
          <>
            <div className="top-bar__overlay" onClick={() => setMenuOpen(false)} />
            <div className="top-bar__menu">
              <p className="top-bar__menu-email">{email}</p>
              <button className="top-bar__menu-signout" onClick={handleSignOut}>
                Terminar sessão
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default TopBar;
