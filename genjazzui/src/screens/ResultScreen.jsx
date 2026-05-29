import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AudioPlayer from "../components/AudioPlayer";
import Icon from "../components/Icon";
import "./ResultScreen.css";

function parseMeasures(chordsStr) {
  if (!chordsStr) return [];
  return chordsStr.split("|").map(m =>
    m.split(",").map(c => c.trim()).filter(Boolean)
  ).filter(m => m.length > 0);
}

function WaveformBars() {
  const heights = [8,15,21,22,17,10,2,4,6,2,4,12,19,22,20,13,5,2,5,5,0,8,16,21,20,14,6,2,4,6];
  return (
    <div className="waveform">
      {heights.map((h, i) => (
        <div key={i} className="waveform__bar" style={{ height: Math.max(2, h) + 'px' }} />
      ))}
    </div>
  );
}

function SaveSheet({ progression, selectedKey, selectedStructure, selectedModulation, saving, onSave, onClose }) {
  const key       = progression?.key || selectedKey || null;
  const structure = selectedStructure  && selectedStructure  !== "Random" ? selectedStructure  : null;
  const modulation = selectedModulation && selectedModulation !== "Random" ? selectedModulation : null;

  const defaultName = (() => {
    if (key && structure) return `${structure} em ${key}`;
    if (key) return `Progressão em ${key}`;
    return "Nova Progressão";
  })();

  const [name, setName] = useState(defaultName);

  async function handleConfirm() {
    await onSave(name.trim() || defaultName);
    onClose();
  }

  return (
    <div className="save-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="save-sheet">
        <div className="save-sheet__handle" />
        <div className="save-sheet__header">
          <h2 className="save-sheet__title">Guardar Progressão</h2>
          <button className="save-sheet__close" onClick={onClose} aria-label="Fechar">
            <Icon name="close" size={14} />
          </button>
        </div>

        {/* Nome */}
        <div className="save-field">
          <label className="save-field__label">Nome da progressão</label>
          <input
            className="save-field__input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Blues em Sol"
            autoFocus
            maxLength={60}
          />
        </div>

        {/* Filtros pré-definidos */}
        <div className="save-meta">
          <p className="save-meta__label">Filtros pré-definidos</p>
          <div className="save-meta__chips">
            {key       && <span className="save-meta__chip save-meta__chip--key">{key}</span>}
            {structure && <span className="save-meta__chip">{structure}</span>}
            {modulation && <span className="save-meta__chip">{modulation}</span>}
            {!key && !structure && !modulation && (
              <span className="save-meta__chip save-meta__chip--none">Geração aleatória</span>
            )}
          </div>
          <p className="save-meta__hint">Estes filtros vão ajudar a encontrar esta progressão na biblioteca</p>
        </div>

        <button
          className="save-btn-primary"
          onClick={handleConfirm}
          disabled={saving || !name.trim()}
        >
          {saving ? <span className="save-spinner" /> : "Guardar na Biblioteca"}
        </button>
      </div>
    </div>
  );
}

export default function ResultScreen({ gj }) {
  const navigate = useNavigate();
  const { progression, selectedKey, selectedStructure, selectedModulation,
          audioUrl, converting, convertToMp3, saving, save } = gj;

  const [showSave, setShowSave] = useState(false);
  const [isSaved, setIsSaved]   = useState(false);

  // Reseta estado de guardado quando há nova progressão
  useEffect(() => { setIsSaved(false); }, [progression]);

  if (!progression) {
    return (
      <div className="result-screen">
        <div className="result-header">
          <button className="result-back" onClick={() => navigate("/generate")} aria-label="Voltar">
            <Icon name="back" size={18} />
          </button>
          <h1 className="result-title">Progressão Gerada</h1>
        </div>
        <div className="result-empty">
          <p>Nenhuma progressão gerada.</p>
          <button className="result-btn-gold" onClick={() => navigate("/generate")}>
            Gerar Progressão
          </button>
        </div>
      </div>
    );
  }

  const measures   = parseMeasures(progression.chords);
  const key        = progression.key || selectedKey || "?";
  const structure  = selectedStructure  || "Random";
  const modulation = selectedModulation || "Random";

  async function handleSaveConfirm(name) {
    await save(name);
    setIsSaved(true);
  }

  return (
    <div className="result-screen">
      {/* Header */}
      <div className="result-header">
        <button className="result-back" onClick={() => navigate("/generate")} aria-label="Voltar">
          <Icon name="back" size={18} />
        </button>
        <h1 className="result-title">Progressão Gerada</h1>
      </div>

      <div className="result-scroll">
        {/* Tags */}
        <div className="result-tags">
          <span className="result-tag result-tag--key">{key}</span>
          <span className="result-tag">{structure}</span>
          <span className="result-tag">{modulation}</span>
        </div>

        {/* Chords card */}
        <div className="result-card">
          <h2 className="result-card__title">Acordes Gerados</h2>
          <p className="result-card__hint">Toca em qualquer acorde para ver detalhes</p>
          <div className="result-measures">
            {measures.map((chords, i) => (
              <div key={i} className="result-measure">
                <div className="result-measure__ruler">
                  <span className="result-measure__label">Compasso {i + 1}</span>
                  <div className="result-measure__chords">
                    {chords.map((c, j) => (
                      <span key={j} className={`result-chord${i % 2 === 0 ? " result-chord--hi" : ""}`}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                {i < measures.length - 1 && <div className="result-measure__sep" />}
              </div>
            ))}
          </div>
        </div>

        {/* Audio player */}
        <div className="result-player">
          {audioUrl ? (
            <AudioPlayer src={audioUrl} />
          ) : (
            <button className="result-player-row" onClick={() => convertToMp3()} disabled={converting}>
              <div className="result-player__play">
                {converting ? <span className="gen2-spinner" /> : <Icon name="play" size={14} />}
              </div>
              <WaveformBars />
              <span className="result-player__time">0:00 / --:--</span>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="result-actions">
          <button
            className={`result-btn-outlined${isSaved ? " result-btn-outlined--saved" : ""}`}
            onClick={() => !isSaved && setShowSave(true)}
            disabled={saving || isSaved}
          >
            {saving
              ? <span className="gen2-spinner" />
              : isSaved
              ? <><Icon name="check" size={14} />&nbsp;Guardado</>
              : <><Icon name="music" size={14} />&nbsp;Guardar</>}
          </button>
          <button className="result-btn-gold" onClick={() => navigate("/generate")}>
            Nova Geração
          </button>
        </div>

        <div style={{ height: 16 }} />
      </div>

      {showSave && (
        <SaveSheet
          progression={progression}
          selectedKey={selectedKey}
          selectedStructure={selectedStructure}
          selectedModulation={selectedModulation}
          saving={saving}
          onSave={handleSaveConfirm}
          onClose={() => setShowSave(false)}
        />
      )}
    </div>
  );
}
