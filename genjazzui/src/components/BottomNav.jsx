import { Link, useLocation } from "react-router-dom";
import Icon from "./Icon";
import "./BottomNav.css";

const TABS = [
  { path: "/home",    label: "Home",      icon: "home"  },
  { path: "/library", label: "Biblioteca", icon: "music" },
  { path: "/profile", label: "Perfil",     icon: "user"  },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="bnav">
      {TABS.map(t => (
        <Link key={t.path} to={t.path}
          className={`bnav__tab${pathname.startsWith(t.path) ? " bnav__tab--active" : ""}`}>
          <Icon name={t.icon} size={20} className="bnav__icon" />
          <span className="bnav__label">{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}
