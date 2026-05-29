import "./MeasureGrid.css";

function parseMeasures(chordString) {
  if (!chordString) return [];
  return chordString
    .split("|")
    .map(m => m.split(",").map(c => c.trim()).filter(Boolean))
    .filter(m => m.length > 0);
}

function MeasureGrid({ chordString }) {
  const measures = parseMeasures(chordString);
  if (!measures.length) return null;

  return (
    <div className="measure-grid">
      {measures.map((chords, i) => (
        <div key={i} className="measure">
          <span className="measure__num">{i + 1}</span>
          <div className="measure__chords">
            {chords.map((chord, j) => (
              <span key={j} className="measure__chord">{chord}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MeasureGrid;
