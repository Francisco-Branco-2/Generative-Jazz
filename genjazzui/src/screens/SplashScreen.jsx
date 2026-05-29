import { useNavigate } from "react-router-dom";
import "./SplashScreen.css";

export default function SplashScreen() {
  const navigate = useNavigate();
  return (
    <div className="splash">
      <div className="splash__top">
        <div className="splash__staff">
          {[0,1,2,3,4].map(i => <div key={i} className="splash__line" />)}
        </div>
        <div className="splash__logo-ring">
          <div className="splash__logo-circle">
            <span className="splash__note">GJ</span>
          </div>
        </div>
        <h1 className="splash__title">Generative Jazz</h1>
        <p className="splash__tagline">Cria progressões de jazz únicas</p>
      </div>
      <div className="splash__bottom">
        <button className="splash__btn-primary" onClick={() => navigate("/register")}>Começar</button>
        <button className="splash__btn-secondary" onClick={() => navigate("/login")}>Entrar</button>
      </div>
    </div>
  );
}
