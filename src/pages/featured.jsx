import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Reveal from "../components/Reveal";
import { project } from "../data/data";
import "../css/work.css";

const pad = (n) => String(n).padStart(2, "0");

// Selected work: the first project is a wide case-study card, the rest sit
// two per row. Each card opens that project's case-study page.
function Featured() {
  const location = useLocation();

  // coming back from a case study ("/#work") -> jump to this section
  useEffect(() => {
    if (location.hash === "#work" || location.hash === "#proj") {
      document.getElementById("work")?.scrollIntoView();
    }
  }, [location.hash]);

  return (
    <section className="sec panel" id="work" data-theme="dark">
      <div className="wrap">
        <Reveal className="label">
          <span className="mono">(03) — Selected work</span>
        </Reveal>
        <Reveal className="sec-head">
          <h2 className="big-h">Systems built<br />for <em>real</em> work.</h2>
          <p className="mono">{pad(project.length)} case studies</p>
        </Reveal>

        <div className="bento">
          {project.map((pro, i) => (
            <Reveal
              key={pro.id}
              className={`case${i === 0 ? " wide" : ""}`}
              delay={i === 0 ? 0 : ((i + 1) % 2) * 0.12}
            >
              <Link to={`/detail/${pro.id}`} data-cursor="View case →" aria-label={`${pro.name} case study`}>
                <span className="case-num mono">{pad(i + 1)} / {pad(project.length)}</span>
                <div className="case-shot">
                  <img src={pro.img} alt={`${pro.name} screenshot`} loading="lazy" />
                </div>
                <div className="case-info">
                  <div>
                    {pro.kind && <span className="mono">{pro.kind}</span>}
                    <h3>{pro.name}</h3>
                    {i === 0 && pro.short && <p className="case-desc">{pro.short}</p>}
                  </div>
                  <div className="case-tags">
                    {pro.stack.slice(0, i === 0 ? 4 : 2).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Featured;
