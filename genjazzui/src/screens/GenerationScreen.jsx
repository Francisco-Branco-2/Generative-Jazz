import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CircleOfFifths from "../components/CircleOfFifths";
import Icon from "../components/Icon";
import "./GenerationScreen.css";

const STRUCTURES = ["Random", "AABA", "AABC", "ABAB"];
const MODULATIONS = ["Random", "Dominant", "Relative", "Subdominant", "Parallel", "Chromatic"];

export default function GenerationScreen({ gj }) {
  const navigate = useNavigate();
  const hasTriggered = useRef(false);

  const {
    selectedKey, setSelectedKey,
    selectedStructure, setSelectedStructure,
    selectedModulation, setSelectedModulation,
    generating, generateError,
  } = gj;

  useEffect(() => {
    if (gj.progression && hasTriggered.current) {
      hasTriggered.current = false;
      navigate("/result");
    }
  }, [gj.progression, navigate]);

  async function handleGenerate() {
    hasTriggered.current = true;
    gj.generate();
  }

  return (
    <div className="gen2-screen">
      {/* Header */}
      <div className="gen2-header">
        <button className="gen2-back" onClick={() => navigate("/home")} aria-label="Voltar"><Icon name="back" size={18} /></button>
        <h1 className="gen2-title">Nova Progressão</h1>
      </div>

      <div className="gen2-scroll">
        {/* Key */}
        <div className="gen2-section">
          <label className="gen2-label">Tonalidade (Key)</label>
          <button
            className={`gen2-random-btn${!selectedKey ? " gen2-random-btn--active" : ""}`}
            onClick={() => setSelectedKey("")}>
            Aleatório
          </button>
          <CircleOfFifths selected={selectedKey} onSelect={setSelectedKey} />
        </div>

        {/* Structure */}
        <div className="gen2-section">
          <label className="gen2-label">Estrutura</label>
          <div className="gen2-pills">
            {STRUCTURES.map(s => (
              <button key={s}
                className={`gen2-pill${selectedStructure === s || (!selectedStructure && s === "Random") ? " gen2-pill--active" : ""}`}
                onClick={() => setSelectedStructure(s === "Random" ? "" : s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Modulation */}
        <div className="gen2-section">
          <label className="gen2-label">Modulação</label>
          <div className="gen2-mod-grid">
            {MODULATIONS.map(m => (
              <button key={m}
                className={`gen2-mod-btn${selectedModulation === m || (!selectedModulation && m === "Random") ? " gen2-mod-btn--active" : ""}`}
                onClick={() => setSelectedModulation(m === "Random" ? "" : m)}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {generateError && <p className="gen2-error">{generateError}</p>}
        <div style={{ height: 80 }} />
      </div>

      {/* Generate button - fixed bottom */}
      <div className="gen2-footer">
        <button className={`gen2-generate-btn${generating ? " gen2-generate-btn--loading" : ""}`}
          onClick={handleGenerate} disabled={generating}>
          {generating
            ? <><span className="gen2-spinner" /> A gerar…</>
            : "Gerar Progressão"}
        </button>
      </div>
    </div>
  );
}
