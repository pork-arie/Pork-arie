import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

import { project } from "../data/data";
import "../css/detail.css";

function Detail() {
  const { id } = useParams();
  const nav = useNavigate();

  const index = project.findIndex((p) => p.id === Number(id));
  const pro = project[index];
  const next = project[(index + 1) % project.length];

  // cover image first, then the rest; skips any that are missing
  const screens = pro
    ? [pro.img, pro.img1, pro.img2, pro.img3].filter(Boolean)
    : [];

  const [active, setActive] = useState(0);
  const [view, setView] = useState(null);

  // new project -> start at the top, first screen
  useEffect(() => {
    window.scrollTo(0, 0);
    setActive(0);
  }, [id]);

  // Esc closes the full-size view
  useEffect(() => {
    if (!view) return;
    const onKey = (e) => e.key === "Escape" && setView(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  if (!pro) {
    return (
      <main className="pd pd-missing">
        <h1 className="pd-title">Project not found</h1>
        <p>This project doesn't exist or was removed.</p>
        <Link className="pd-btn" to="/#proj">See all projects</Link>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pro.name} | Ariel Angel Portfolio</title>
        <meta name="description" content={pro.description} />
        <meta property="og:title" content={pro.name} />
      </Helmet>

      <main className="pd">
        {/* ---------- top bar ---------- */}
        <header className="pd-bar">
          <button type="button" className="pd-back" onClick={() => nav("/#proj")}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            All projects
          </button>
          <span className="pd-count">
            {index + 1} / {project.length}
          </span>
        </header>

        {/* ---------- hero ---------- */}
        <section className="pd-hero">
          <div className="pd-intro">
            <h1 className="pd-title">{pro.name}</h1>
            {pro.role && <p className="pd-role">{pro.role}</p>}
            <p className="pd-desc">{pro.description}</p>

            {(pro.live || pro.github) && (
              <div className="pd-links">
                {pro.live && (
                  <a className="pd-link is-primary" href={pro.live} target="_blank" rel="noreferrer">
                    Visit live site
                  </a>
                )}
                {pro.github && (
                  <a className="pd-link" href={pro.github} target="_blank" rel="noreferrer">
                    View code on GitHub
                  </a>
                )}
              </div>
            )}

            <h2 className="pd-label">Built with</h2>
            <ul className="pd-stack">
              {pro.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </div>

          <motion.div
            className="pd-showcase"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* laptop mockup */}
            <div className="laptop">
              <div className="laptop-lid">
                <span className="laptop-cam" aria-hidden="true" />
                <button
                  type="button"
                  className="laptop-display"
                  onClick={() => setView(screens[active])}
                  aria-label={`View ${pro.name} screen ${active + 1} full size`}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={screens[active]}
                      src={screens[active]}
                      alt={`${pro.name} screen ${active + 1}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    />
                  </AnimatePresence>
                </button>
              </div>
              <div className="laptop-base" aria-hidden="true">
                <span />
              </div>
            </div>

            {/* screen switcher */}
            {screens.length > 1 && (
              <div className="pd-thumbs" role="tablist" aria-label="Screens">
                {screens.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    className={i === active ? "is-active" : ""}
                    onClick={() => setActive(i)}
                  >
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </section>

        {/* ---------- case study ---------- */}
        {(pro.problem || pro.built?.length > 0) && (
          <section className="pd-story">
            {pro.problem && (
              <div>
                <h2 className="pd-story-title">The problem</h2>
                <p>{pro.problem}</p>
              </div>
            )}
            {pro.built?.length > 0 && (
              <div>
                <h2 className="pd-story-title">What I built</h2>
                <ul className="pd-built">
                  {pro.built.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* ---------- all screens ---------- */}
        {screens.length > 1 && (
          <section className="pd-screens dotted-bg">
            <h2 className="pd-section-title">Screens</h2>
            <div className="pd-grid">
              {screens.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className="browser"
                  onClick={() => setView(src)}
                  aria-label={`View screen ${i + 1} full size`}
                >
                  <span className="browser-bar" aria-hidden="true">
                    <i /><i /><i />
                  </span>
                  <img src={src} alt={`${pro.name} screen ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ---------- next project ---------- */}
        {project.length > 1 && (
          <Link to={`/detail/${next.id}`} className="pd-next">
            <span className="pd-next-text">
              <small>Next project</small>
              <strong>{next.name}</strong>
            </span>
            <img src={next.img} alt="" loading="lazy" />
          </Link>
        )}

        {/* ---------- full-size view ---------- */}
        {view && (
          <div className="lightbox-overlay" onClick={() => setView(null)}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="lightbox-close"
                onClick={() => setView(null)}
                aria-label="Close"
              >
                ×
              </button>
              <img src={view} alt="" />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default Detail;