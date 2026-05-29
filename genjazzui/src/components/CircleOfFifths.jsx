import "./CircleOfFifths.css";

const MAJOR = ["C","G","D","A","E","B","F#","Db","Ab","Eb","Bb","F"];
const MINOR = ["Am","Em","Bm","F#m","C#m","G#m","D#m","Bbm","Fm","Cm","Gm","Dm"];
const CX = 150, CY = 150;

function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function segmentPath(cx, cy, r1, r2, startDeg, endDeg) {
  const [x1, y1] = polar(cx, cy, r1, startDeg);
  const [x2, y2] = polar(cx, cy, r1, endDeg);
  const [x3, y3] = polar(cx, cy, r2, endDeg);
  const [x4, y4] = polar(cx, cy, r2, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M${x1},${y1} A${r1},${r1} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${r2},${r2} 0 ${large} 0 ${x4},${y4} Z`;
}

export default function CircleOfFifths({ selected, onSelect }) {
  const segments = 12;
  const step = 360 / segments;

  return (
    <div className="cof">
      <svg viewBox="0 0 300 300" className="cof__svg">
        {/* Outer ring - major keys */}
        {MAJOR.map((key, i) => {
          const start = i * step;
          const end = start + step;
          const mid = start + step / 2;
          const [tx, ty] = polar(CX, CY, 118, mid);
          const isSelected = selected === key;
          return (
            <g key={key} onClick={() => onSelect(key)} className="cof__seg">
              <path d={segmentPath(CX, CY, 138, 98, start, end)}
                className={`cof__outer${isSelected ? " cof__outer--active" : ""}`} />
              <text x={tx} y={ty} className={`cof__major-label${isSelected ? " cof__major-label--active" : ""}`}
                textAnchor="middle" dominantBaseline="middle">{key}</text>
            </g>
          );
        })}

        {/* Middle ring - minor keys */}
        {MINOR.map((key, i) => {
          const start = i * step;
          const end = start + step;
          const mid = start + step / 2;
          const [tx, ty] = polar(CX, CY, 82, mid);
          const majorKey = MAJOR[i];
          const isSelected = selected === key || selected === majorKey;
          return (
            <g key={key} onClick={() => onSelect(key)} className="cof__seg">
              <path d={segmentPath(CX, CY, 95, 68, start, end)}
                className={`cof__inner${isSelected ? " cof__inner--active" : ""}`} />
              <text x={tx} y={ty} className="cof__minor-label"
                textAnchor="middle" dominantBaseline="middle">{key}</text>
            </g>
          );
        })}

        {/* Center circle */}
        <circle cx={CX} cy={CY} r={58} className="cof__center" />
        <text x={CX} y={CY} className="cof__center-label"
          textAnchor="middle" dominantBaseline="middle">
          {selected || "Key"}
        </text>
      </svg>
    </div>
  );
}
