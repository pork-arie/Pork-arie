import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { goWithCurtain } from "../components/transition";
import Reveal from "../components/Reveal";
import { project } from "../data/data";
import "../css/work.css";

const pad = (n) => String(n).padStart(2, "0");

// Selected work: the first project is a wide case-study card, the rest sit
// two per row. Each card opens that project's case-study page.
function Featured() {
  const location = useLocation();
  const navigate = useNavigate();

  // coming back from a case study ("/#work", "/#contact") -> jump to that section
  useEffect(() => {
    const id = location.hash === "#proj" ? "work" : location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
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
          {project.map((pro, i) => {
            // the first card is wide; so is the last one if it would sit alone in its row
            const wide = i === 0 || (i === project.length - 1 && i % 2 === 1);
            return (
              <Reveal
                key={pro.id}
                className={`case${wide ? " wide" : ""}`}
                delay={i === 0 ? 0 : ((i + 1) % 2) * 0.12}
              >
                <Link
                  to={`/detail/${pro.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    goWithCurtain(navigate, `/detail/${pro.id}`);
                  }}
                  data-cursor="View case →"
                  aria-label={`${pro.name} case study`}
                >
                  <span className="case-num mono">{pad(i + 1)} / {pad(project.length)}</span>
                  <div className="case-shot">
                    <img src={pro.img} alt={`${pro.name} screenshot`} loading="lazy" />
                  </div>
                  <div className="case-info">
                    <div>
                      {pro.kind && <span className="mono">{pro.kind}</span>}
                      <h3>{pro.name}</h3>
                      {wide && pro.short && <p className="case-desc">{pro.short}</p>}
                    </div>
                    <div className="case-tags">
                      {pro.stack.slice(0, wide ? 4 : 2).map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Featured;
