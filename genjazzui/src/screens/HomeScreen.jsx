import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Icon from "../components/Icon";
import "./HomeScreen.css";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
}

function initials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function RecentCard({ item, onPlay }) {
  const date = item.created_at
    ? new Date(item.created_at).toLocaleDateString("pt-PT", { day: "numeric", month: "short" })
    : "";
  return (
    <div className="home-recent-card">
      <div className="home-recent-card__accent" />
      <div className="home-recent-card__body">
        <p className="home-recent-card__title">{item.key} – {item.structure}</p>
        <div className="home-recent-card__chips">
          <span className="home-chip home-chip--key">{item.key}</span>
          <span className="home-chip">{item.structure}</span>
        </div>
        <div className="home-recent-card__footer">
          <span className="home-recent-card__date">{date}</span>
          <button className="home-recent-card__play" onClick={() => onPlay(item)}
            aria-label="Reproduzir"><Icon name="play" size={11} /></button>
        </div>
      </div>
    </div>
  );
}

export default function HomeScreen({ gj }) {
  const { getName } = useAuth();
  const navigate = useNavigate();
  const name = getName();
  const inits = initials(name || "U");
  const recent = (gj.savedProgressions || []).slice(0, 5);

  return (
    <div className="home-screen">
      {/* Header */}
      <div className="home-header">
        <div>
          <h1 className="home-header__greeting">Olá, {name.split(" ")[0]}!</h1>
          <p className="home-header__sub">{getGreeting()}</p>
        </div>
        <button className="home-avatar" onClick={() => navigate("/profile")}>{inits}</button>
      </div>

      <div className="home-scroll">
        {/* CTA Card */}
        <div className="home-cta">
          <div className="home-cta__accent" />
          <div className="home-cta__content">
            <div className="home-cta__icon"><Icon name="note" size={26} /></div>
            <div className="home-cta__text">
              <p className="home-cta__title">Criar nova progressão</p>
              <p className="home-cta__desc">Gera acordes de jazz únicos baseados nos teus parâmetros</p>
            </div>
          </div>
          <button className="home-cta__btn" onClick={() => navigate("/generate")}>Gerar</button>
        </div>

        {/* Recentes */}
        <div className="home-section-header">
          <h2 className="home-section-title">Recentes</h2>
          <button className="home-section-link" onClick={() => navigate("/library")}>Ver todos</button>
        </div>

        {recent.length === 0 ? (
          <div className="home-empty">
            <p>Ainda não tens progressões guardadas.</p>
            <button className="home-empty__btn" onClick={() => navigate("/generate")}>
              Gerar primeira progressão
            </button>
          </div>
        ) : (
          <div className="home-recent-row">
            {recent.map(item => (
              <RecentCard key={item.id} item={item} onPlay={() => navigate("/library")} />
            ))}
          </div>
        )}

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
