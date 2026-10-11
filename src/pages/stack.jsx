import Reveal from "../components/Reveal";
import { toolkit } from "../data/data";
import "../css/toolkit.css";

// Toolkit: the tools I use, grouped in three columns (edit them in data.jsx)
function Stack() {
  return (
    <section className="sec" id="stack" data-theme="light">
      <div className="wrap">
        <Reveal className="label">
          <span className="mono">(02) — Toolkit</span>
        </Reveal>
        <Reveal className="stack-grid">
          {toolkit.map((col) => (
            <div className="stack-col" key={col.group}>
              <span className="mono">{col.group}</span>
              <h3>{col.title}</h3>
              <div className="chips">
                {col.tools.map((t) => (
                  <span className="chip" key={t}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export default Stack;
