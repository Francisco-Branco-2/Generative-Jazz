import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import Icon from "../components/Icon";
import "./ProfileScreen.css";

/* ── Bottom sheet overlay ── */
function Sheet({ title, onClose, children }) {
  return (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet__handle" />
        <div className="sheet__header">
          <h2 className="sheet__title">{title}</h2>
          <button className="sheet__close" onClick={onClose} aria-label="Fechar"><Icon name="close" size={14} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Edit Profile sheet ── */
function EditProfileSheet({ onClose }) {
  const { getName, getPhoto, updateName, updatePhoto } = useAuth();
  const [name, setName] = useState(getName());
  const [preview, setPreview] = useState(getPhoto());
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    updateName(name.trim());
    if (preview !== getPhoto()) updatePhoto(preview);
    setSaving(false);
    onClose();
  }

  return (
    <Sheet title="Editar Perfil" onClose={onClose}>
      {/* Photo picker */}
      <div className="sheet-photo-row">
        <div className="sheet-avatar" onClick={() => fileRef.current.click()}>
          {preview
            ? <img src={preview} alt="foto" className="sheet-avatar__img" />
            : <span className="sheet-avatar__inits">
                {name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
              </span>
          }
          <div className="sheet-avatar__cam"><Icon name="camera" size={20} /></div>
        </div>
        <div>
          <p className="sheet-photo-hint">Toca na imagem para alterar</p>
          <p className="sheet-photo-hint sheet-photo-hint--sub">JPG, PNG até 5 MB</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*"
          style={{ display: "none" }} onChange={handlePhoto} />
      </div>

      {/* Name field */}
      <div className="sheet-field">
        <label className="sheet-field__label">Nome de utilizador</label>
        <input className="sheet-field__input" type="text"
          value={name} onChange={e => setName(e.target.value)}
          placeholder="O seu nome" />
      </div>

      <button className="sheet-btn-primary" onClick={handleSave} disabled={saving || !name.trim()}>
        {saving ? <span className="sheet-spinner" /> : "Guardar alterações"}
      </button>
    </Sheet>
  );
}

/* ── Change Password sheet ── */
function ChangePasswordSheet({ onClose }) {
  const { updatePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setError("");
    if (next.length < 8) { setError("Nova palavra-passe deve ter mínimo 8 caracteres."); return; }
    if (next !== confirm) { setError("As palavras-passe não coincidem."); return; }
    setLoading(true);
    try {
      await updatePassword(current, next);
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet title="Alterar Palavra-passe" onClose={onClose}>
      {success ? (
        <div className="sheet-success">
          <span className="sheet-success__icon"><Icon name="check" size={20} strokeWidth={2.5} /></span>
          <p>Palavra-passe alterada com sucesso!</p>
        </div>
      ) : (
        <>
          <div className="sheet-field">
            <label className="sheet-field__label">Palavra-passe atual</label>
            <input className="sheet-field__input" type="password"
              autoComplete="current-password"
              value={current} onChange={e => setCurrent(e.target.value)}
              placeholder="••••••••" />
          </div>
          <div className="sheet-field">
            <label className="sheet-field__label">Nova palavra-passe</label>
            <input className="sheet-field__input" type="password"
              autoComplete="new-password"
              value={next} onChange={e => setNext(e.target.value)}
              placeholder="Mínimo 8 caracteres" />
          </div>
          <div className="sheet-field">
            <label className="sheet-field__label">Confirmar nova palavra-passe</label>
            <input className="sheet-field__input" type="password"
              autoComplete="new-password"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Repete a nova palavra-passe" />
          </div>
          {error && <p className="sheet-error">{error}</p>}
          <button className="sheet-btn-primary" onClick={handleSave}
            disabled={loading || !current || !next || !confirm}>
            {loading ? <span className="sheet-spinner" /> : "Alterar palavra-passe"}
          </button>
        </>
      )}
    </Sheet>
  );
}

/* ── Settings row ── */
function SettingRow({ icon, label, value, arrow, toggle, onToggle, onClick }) {
  return (
    <div className="prof-row" onClick={onClick} style={onClick ? { cursor: "pointer" } : {}}>
      {icon && <span className="prof-row__icon">{icon}</span>}
      <span className="prof-row__label">{label}</span>
      {value && <span className="prof-row__value">{value}</span>}
      {toggle !== undefined && (
        <button className={`prof-toggle${toggle ? " prof-toggle--on" : ""}`}
          onClick={e => { e.stopPropagation(); onToggle(); }} aria-label={label}>
          <span className="prof-toggle__thumb" />
        </button>
      )}
      {arrow && <span className="prof-row__arrow"><Icon name="chevRight" size={16} /></span>}
    </div>
  );
}

/* ── Colorblind accessibility sheet ── */
const COLORBLIND_MODES = [
  { id: "none",         label: "Padrão",       desc: "Cores originais da aplicação",               swatches: ["#c9a84c", "#d95555", "#5cb88a"] },
  { id: "deuteranopia", label: "Deuteranopia",  desc: "Dificuldade em distinguir verde e vermelho", swatches: ["#56B4E9", "#E69F00", "#0072B2"] },
  { id: "protanopia",   label: "Protanopia",    desc: "Dificuldade em perceber o vermelho",         swatches: ["#56B4E9", "#E69F00", "#009E73"] },
  { id: "tritanopia",   label: "Tritanopia",    desc: "Dificuldade em distinguir azul e amarelo",  swatches: ["#D55E00", "#CC3311", "#009E73"] },
];

function ColorblindSheet({ onClose }) {
  const { colorblindMode, setColorblindMode } = useTheme();
  return (
    <Sheet title="Acessibilidade de Cores" onClose={onClose}>
      <p className="colorblind-info">
        Ajusta a paleta de cores para melhor visibilidade de acordo com o tipo de daltonismo.
      </p>
      <div className="colorblind-options">
        {COLORBLIND_MODES.map(mode => (
          <button
            key={mode.id}
            className={`colorblind-option${colorblindMode === mode.id ? " colorblind-option--active" : ""}`}
            onClick={() => { setColorblindMode(mode.id); onClose(); }}
          >
            <div className="colorblind-option__swatches">
              {mode.swatches.map((c, i) => (
                <span key={i} className="colorblind-option__swatch" style={{ background: c }} />
              ))}
            </div>
            <div className="colorblind-option__text">
              <span className="colorblind-option__label">{mode.label}</span>
              <span className="colorblind-option__desc">{mode.desc}</span>
            </div>
            {colorblindMode === mode.id && (
              <span className="colorblind-option__check"><Icon name="check" size={16} /></span>
            )}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/* ── Privacy Policy sheet ── */
function PrivacyPolicySheet({ onClose }) {
  return (
    <Sheet title="Política de Privacidade" onClose={onClose}>
      <div className="privacy-content">
        <div className="privacy-badge">
          <Icon name="shield" size={20} />
          <span>Aplicação Exclusivamente Educacional</span>
        </div>

        <div className="privacy-section">
          <h3 className="privacy-section__title">Finalidade</h3>
          <p className="privacy-section__text">
            Esta aplicação — <strong>Generative Jazz</strong> — foi criada exclusivamente
            para fins educacionais, no âmbito da unidade curricular de Interação
            Humano-Computador (IHC). Não tem qualquer finalidade comercial.
          </p>
        </div>

        <div className="privacy-section">
          <h3 className="privacy-section__title">Progressões Musicais</h3>
          <p className="privacy-section__text">
            As progressões de jazz geradas são calculadas pela API pública GenJazz,
            unicamente para fins demonstrativos e académicos. Não são associadas
            a dados pessoais identificáveis.
          </p>
        </div>

        <div className="privacy-section">
          <h3 className="privacy-section__title">Isenção de Responsabilidade</h3>
          <p className="privacy-section__text">
            Por ser um protótipo educacional, não são oferecidas garantias de
            disponibilidade contínua, segurança de nível comercial ou suporte técnico.
            Destina-se exclusivamente ao contexto académico para o qual foi desenvolvida.
          </p>
        </div>

        <div className="privacy-section">
          <h3 className="privacy-section__title">Os Teus Direitos</h3>
          <p className="privacy-section__text">
            Podes eliminar todos os dados a qualquer momento através das definições
            do teu navegador (limpar dados do site). Ao usar esta aplicação,
            aceitas os termos de uso educacional aqui descritos.
          </p>
        </div>

        <p className="privacy-footer">
          Versão 1.0.0 · IHC 2025/2026 · Uso exclusivamente educacional
        </p>
      </div>
    </Sheet>
  );
}

/* ── Main screen ── */
export default function ProfileScreen() {
  const { email, profileVersion, getName, getPhoto, signOut } = useAuth();
  const { colorblindMode } = useTheme();
  const navigate = useNavigate();
  const name = getName();
  const photo = getPhoto();
  const inits = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const [notif, setNotif] = useState(true);
  const [sheet, setSheet] = useState(null); // "edit" | "password" | "privacy" | "colorblind" | null

  // profileVersion in deps ensures re-render after updates
  void profileVersion;

  function handleSignOut() {
    signOut();
    navigate("/splash", { replace: true });
  }

  return (
    <div className="prof-screen">
      {/* Header */}
      <div className="prof-header">
        <h1 className="prof-header__title">Perfil</h1>
      </div>

      <div className="prof-scroll">
        {/* Avatar */}
        <div className="prof-avatar-section">
          <div className="prof-avatar-wrap">
            <div className="prof-avatar" onClick={() => setSheet("edit")}>
              {photo
                ? <img src={photo} alt="perfil" className="prof-avatar__img" />
                : inits
              }
            </div>
            <button className="prof-avatar__cam" onClick={() => setSheet("edit")}
              aria-label="Alterar foto"><Icon name="camera" size={14} /></button>
          </div>
          <p className="prof-name">{name}</p>
          <p className="prof-email">{email}</p>
        </div>

        <div className="prof-sep" />

        {/* CONTA */}
        <p className="prof-section-title">Conta</p>
        <div className="prof-group">
          <SettingRow icon={<Icon name="edit" size={16} />} label="Editar Perfil" arrow onClick={() => setSheet("edit")} />
          <div className="prof-divider" />
          <SettingRow icon={<Icon name="lock" size={16} />} label="Alterar Palavra-passe" arrow onClick={() => setSheet("password")} />
        </div>

        <div className="prof-sep" />

        {/* PREFERÊNCIAS */}
        <p className="prof-section-title">Preferências</p>
        <div className="prof-group">
          <SettingRow icon={<Icon name="bell" size={16} />} label="Notificações" toggle={notif} onToggle={() => setNotif(v => !v)} />
          <div className="prof-divider" />
          <SettingRow
            icon={<Icon name="eye" size={16} />}
            label="Acessibilidade de Cores"
            value={COLORBLIND_MODES.find(m => m.id === colorblindMode)?.label ?? "Padrão"}
            arrow
            onClick={() => setSheet("colorblind")}
          />
        </div>

        <div className="prof-sep" />

        {/* INFORMAÇÕES */}
        <p className="prof-section-title">Informações</p>
        <div className="prof-group">
          <SettingRow label="Versão" value="1.0.0" />
          <div className="prof-divider" />
          <SettingRow
            icon={<Icon name="shield" size={16} />}
            label="Política de Privacidade"
            arrow
            onClick={() => setSheet("privacy")}
          />
        </div>

        <button className="prof-signout" onClick={handleSignOut}>Terminar Sessão</button>
        <div style={{ height: 16 }} />
      </div>

      {/* Sheets */}
      {sheet === "edit"       && <EditProfileSheet     onClose={() => setSheet(null)} />}
      {sheet === "password"   && <ChangePasswordSheet  onClose={() => setSheet(null)} />}
      {sheet === "privacy"    && <PrivacyPolicySheet   onClose={() => setSheet(null)} />}
      {sheet === "colorblind" && <ColorblindSheet      onClose={() => setSheet(null)} />}
    </div>
  );
}
