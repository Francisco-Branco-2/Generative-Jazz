import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AudioPlayer from "../components/AudioPlayer";
import Icon from "../components/Icon";
import "./LibraryScreen.css";

const BASE_URL = "https://genjazz-api.fly.dev";
const CATEGORIES = ["Todos", "Tonalidade", "Estrutura", "Modulação"];

function LibraryItem({ item, onDelete }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const date = item.created_at
    ? new Date(item.created_at).toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" })
    : "";

  async function handlePlay() {
    if (audioUrl) { setExpanded(v => !v); return; }
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/chords2mp3/${encodeURIComponent(item.chords)}`);
      const data = await res.json();
      const url = `${BASE_URL}${data.mp3_url}`;
      setAudioUrl(url);
      setExpanded(true);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const displayName = item.name || `${item.key} – ${item.structure || "Progressão"}`;

  return (
    <div className={`lib2-item${expanded ? " lib2-item--expanded" : ""}`}>
      <div className="lib2-item__accent" />
      <div className="lib2-item__body">
        <div className="lib2-item__main">
          <div className="lib2-item__info">
            <p className="lib2-item__name">{displayName}</p>
            <div className="lib2-item__chips">
              {item.key       && <span className="lib2-chip lib2-chip--key">{item.key}</span>}
              {item.structure && item.structure !== "Random" && <span className="lib2-chip">{item.structure}</span>}
              {item.modulation && item.modulation !== "Random" && <span className="lib2-chip lib2-chip--mod">{item.modulation}</span>}
            </div>
            <p className="lib2-item__date">{date}</p>
          </div>
          <div className="lib2-item__actions">
            <button className="lib2-play" onClick={handlePlay} disabled={loading} aria-label="Reproduzir">
              {loading
                ? <span className="lib2-spinner" />
                : expanded
                ? <Icon name="chevDown" size={14} />
                : <Icon name="play" size={12} />}
            </button>
          </div>
        </div>
        {expanded && audioUrl && (
          <div className="lib2-item__player">
            <AudioPlayer src={audioUrl} compact />
          </div>
        )}
      </div>
    </div>
  );
}

export default function LibraryScreen({ gj }) {
  const { savedProgressions, libraryLoading, deleteProgression } = gj;
  const [query, setQuery]       = useState("");
  const [category, setCategory] = useState("Todos");
  const [subFilter, setSubFilter] = useState("");

  // Valores únicos para sub-filtros
  const keys        = [...new Set(savedProgressions.map(p => p.key).filter(Boolean))].sort();
  const structures  = [...new Set(savedProgressions.map(p => p.structure).filter(s => s && s !== "Random"))].sort();
  const modulations = [...new Set(savedProgressions.map(p => p.modulation).filter(m => m && m !== "Random"))].sort();

  function selectCategory(cat) {
    setCategory(cat);
    setSubFilter("");
  }

  function toggleSubFilter(val) {
    setSubFilter(prev => prev === val ? "" : val);
  }

  const subOptions = category === "Tonalidade" ? keys
    : category === "Estrutura"  ? structures
    : category === "Modulação"  ? modulations
    : [];

  const filtered = savedProgressions.filter(p => {
    const q = query.toLowerCase();
    if (q) {
      const nameOk  = p.name?.toLowerCase().includes(q);
      const keyOk   = p.key?.toLowerCase().includes(q);
      const structOk = p.structure?.toLowerCase().includes(q);
      if (!nameOk && !keyOk && !structOk) return false;
    }
    if (category === "Tonalidade" && subFilter) return p.key === subFilter;
    if (category === "Estrutura"  && subFilter) return p.structure === subFilter;
    if (category === "Modulação"  && subFilter) return p.modulation === subFilter;
    return true;
  });

  return (
    <div className="lib2-screen">
      {/* Header — sem ícone de pesquisa */}
      <div className="lib2-header">
        <h1 className="lib2-header__title">Biblioteca</h1>
        <span className="lib2-header__count">{savedProgressions.length} progressões</span>
      </div>

      <div className="lib2-scroll">
        {/* Search bar */}
        <div className="lib2-search">
          <Icon name="search" size={15} className="lib2-search__icon" />
          <input
            className="lib2-search__input"
            type="text"
            placeholder="Pesquisar progressões..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="lib2-search__clear" onClick={() => setQuery("")} aria-label="Limpar">
              <Icon name="close" size={12} />
            </button>
          )}
        </div>

        {/* Filtros — nível 1: categorias */}
        <div className="lib2-filter-section">
          <p className="lib2-filter-label">Filtrar por</p>
          <div className="lib2-filter-row">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`lib2-filter${category === cat ? " lib2-filter--active" : ""}`}
                onClick={() => selectCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Nível 2: sub-filtros dinâmicos */}
          {category !== "Todos" && subOptions.length > 0 && (
            <div className="lib2-subfilter-row">
              {subOptions.map(val => (
                <button
                  key={val}
                  className={`lib2-subfilter${subFilter === val ? " lib2-subfilter--active" : ""}`}
                  onClick={() => toggleSubFilter(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          )}

          {category !== "Todos" && subOptions.length === 0 && (
            <p className="lib2-filter-empty-hint">Sem {category.toLowerCase()}s disponíveis</p>
          )}
        </div>

        {/* Lista */}
        {libraryLoading ? (
          <div className="lib2-loading"><span className="lib2-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="lib2-empty">
            <Icon name="music" size={32} />
            <p>
              {savedProgressions.length === 0
                ? "Ainda não tens progressões guardadas"
                : "Nenhuma progressão encontrada"}
            </p>
            {savedProgressions.length > 0 && subFilter && (
              <button className="lib2-empty-reset" onClick={() => { setSubFilter(""); setCategory("Todos"); }}>
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="lib2-list">
            {filtered.map(p => (
              <LibraryItem key={p.id} item={p} onDelete={deleteProgression} />
            ))}
          </div>
        )}

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
