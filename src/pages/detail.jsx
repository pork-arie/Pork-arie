import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Helmet } from "react-helmet-async";

import { project } from "../data/data";
import Reveal from "../components/Reveal";
import { EASE } from "../components/motion";
import { goWithCurtain } from "../components/transition";
import useBarTheme from "../components/useBarTheme";
import "../css/detail.css";

const pad = (n) => String(n).padStart(2, "0");

// A screenshot inside a simple browser window frame
function Browser({ src, alt, label, className = "", onOpen }) {
  return (
    <button type="button" className={`browser ${className}`} onClick={onOpen} aria-label={`View ${alt} full size`}>
      <span className="browser-bar" aria-hidden="true">
        <i /><i /><i />
        {label && <span>{label}</span>}
      </span>
      <img src={src} alt={alt} loading="lazy" />
    </button>
  );
}

// true on phone-sized screens (the scroll effects switch off there)
function useIsSmall() {
  const query = "(max-width: 760px)";
  const [small, setSmall] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setSmall(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return small;
}

// Case-study page: one template for every project, tinted with the
// project's own color (theme in data.jsx).
function Detail() {
  const { id } = useParams();
  const nav = useNavigate();
  const small = useIsSmall();
  const { scrolled, theme } = useBarTheme();

  const index = project.findIndex((p) => p.id === Number(id));
  const pro = project[index];
  const next = project[(index + 1) % project.length];
  // img, img1, img2 … img9: every screenshot the project has, in order
  const screens = pro
    ? [pro.img, ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => pro[`img${n}`])].filter(Boolean)
    : [];
  const caption = (i) => pro?.captions?.[i] ?? `Screen ${i + 1}`;

  const [view, setView] = useState(null);

  // Esc closes the full-size view
  useEffect(() => {
    if (!view) return;
    const onKey = (e) => e.key === "Escape" && setView(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  // showcase: the main screen starts tilted back and flattens as it scrolls in
  const showRef = useRef(null);
  const { scrollYProgress: showP } = useScroll({ target: showRef, offset: ["start end", "start 10%"] });
  const tilt = useTransform(showP, [0, 1], [24, 0]);
  const grow = useTransform(showP, [0, 1], [0.9, 1]);
  const driftA = useTransform(showP, [0, 1], [160, 0]);
  const driftB = useTransform(showP, [0, 1], [220, 0]);

  // screens gallery: scrolling down slides the row of screens sideways
  const galRef = useRef(null);
  const trackRef = useRef(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress: galP } = useScroll({ target: galRef, offset: ["start start", "end end"] });
  const slide = useTransform(galP, [0, 1], [0, -distance]);
  useLayoutEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (el) setDistance(Math.max(0, el.scrollWidth - window.innerWidth + 80));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [id]);

  if (!pro) {
    return (
      <main className="pd pd-missing" data-theme="light">
        <h1 className="big-h">Project not found</h1>
        <p>This project doesn't exist or was removed.</p>
        <Link className="btn" to="/#work">See all projects</Link>
      </main>
    );
  }

  const go = (to) => (e) => {
    e.preventDefault();
    goWithCurtain(nav, to);
  };
  const accent = {
    "--proj": pro.theme?.color ?? "#2E4FC7",
    "--proj-soft": pro.theme?.soft ?? "#E6ECFF",
    "--proj-glow": pro.theme?.glow ?? "rgba(120,150,255,.28)",
  };
  const meta = [
    ["Role", pro.role],
    ["Platform", pro.platform],
    ["Built for", pro.builtFor],
    ["Stack", pro.stack.slice(0, 4).join(" · ")],
  ].filter(([, v]) => v);

  return (
    <>
      <Helmet>
        <title>{pro.name} | Ariel Angel Portfolio</title>
        <meta name="description" content={pro.description} />
        <meta property="og:title" content={pro.name} />
      </Helmet>

      <header className={`topbar pd-bar${scrolled ? " scrolled" : ""}`} data-on={theme}>
        <div className="wrap">
          <a className="pd-back mono" href="/#work" onClick={go("/#work")}>
            <i aria-hidden="true">←</i>
            <span>All projects</span>
          </a>
          <a className="brand" href="/" onClick={go("/")}>ANGHEL</a>
          <span className="mono pd-count">{pad(index + 1)} / {pad(project.length)}</span>
        </div>
      </header>

      <main className="pd" style={accent} key={pro.id}>
        {/* ---------- intro ---------- */}
        <section className="pd-hero" data-theme="light">
          <div className="wrap">
            <motion.div
              className="pd-kicker"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            >
              {pro.kind && <span className="pd-pill">{pro.kind.split(" · ")[0]}</span>}
              <span className="mono">Case study {pad(index + 1)}</span>
            </motion.div>

            <h1 className="pd-title" aria-label={pro.name}>
              {[...pro.name].map((ch, i) =>
                ch === " " ? (
                  <span className="pd-space" key={i} />
                ) : (
                  <span className="mask" key={i} aria-hidden="true">
                    <motion.span
                      initial={{ y: "105%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 1.2, ease: EASE, delay: 0.3 + i * 0.035 }}
                    >
                      {ch}
                    </motion.span>
                  </span>
                ),
              )}
            </h1>

            <Reveal className="pd-intro" delay={0.4}>
              <p className="pd-desc">{pro.description}</p>
              {(pro.live || pro.github) && (
                <div className="pd-links">
                  {pro.live && (
                    <a className="btn primary" href={pro.live} target="_blank" rel="noreferrer">
                      Visit live site <span className="arr">↗</span>
                    </a>
                  )}
                  {pro.github && (
                    <a className="btn" href={pro.github} target="_blank" rel="noreferrer">
                      View code on GitHub
                    </a>
                  )}
                </div>
              )}
            </Reveal>

            <Reveal className="pd-meta" delay={0.5}>
              {meta.map(([k, v]) => (
                <div key={k}>
                  <span className="mono">{k}</span>
                  <b>{v}</b>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ---------- showcase ---------- */}
        <section className="panel pd-show" data-theme="dark" ref={showRef}>
          <div className="wrap">
            <motion.div
              className="pd-main-shot"
              style={small ? undefined : { rotateX: tilt, scale: grow }}
            >
              <Browser
                src={screens[0]}
                alt={`${pro.name} ${caption(0)}`}
                label={`${pro.name} · ${caption(0)}`}
                onOpen={() => setView(screens[0])}
              />
            </motion.div>
            {screens[1] && (
              <motion.div className="pd-float f1" style={{ y: driftA, rotate: -3 }}>
                <Browser src={screens[1]} alt={`${pro.name} ${caption(1)}`} onOpen={() => setView(screens[1])} />
              </motion.div>
            )}
            {screens[2] && (
              <motion.div className="pd-float f2" style={{ y: driftB, rotate: 3 }}>
                <Browser src={screens[2]} alt={`${pro.name} ${caption(2)}`} onOpen={() => setView(screens[2])} />
              </motion.div>
            )}
            <div className="pd-show-cap">
              <span className="mono">{caption(0)} — {pro.name}</span>
              <span className="mono">Scroll ↓</span>
            </div>
          </div>
        </section>

        {/* ---------- the story ---------- */}
        {(pro.problem || pro.built?.length > 0) && (
          <section className="sec" data-theme="light">
            <div className="wrap">
              <div className="pd-story">
                {pro.problem && (
                  <Reveal>
                    <span className="mono">(01) — The problem</span>
                    <h2>{pro.problem}</h2>
                  </Reveal>
                )}
                {pro.built?.length > 0 && (
                  <Reveal delay={0.1}>
                    <span className="mono">(02) — What I built</span>
                    <ul className="pd-built">
                      {pro.built.map((item, i) => (
                        <li key={item}>
                          <span>{pad(i + 1)}</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )}
              </div>
              <Reveal className="pd-stack">
                {pro.stack.map((t) => (
                  <span className="chip" key={t}>{t}</span>
                ))}
              </Reveal>
            </div>
          </section>
        )}

        {/* ---------- all screens ---------- */}
        {screens.length > 1 && (
          <section className="pd-gal" data-theme="light" ref={galRef}>
            <div className="pd-gal-pin">
              <div className="wrap pd-gal-head">
                <div>
                  <span className="mono">(03) — Screens</span>
                  <h2 className="big-h">Inside the <em>product.</em></h2>
                </div>
                <span className="mono">{screens.length} screens · click to enlarge</span>
              </div>
              <motion.div className="pd-track" ref={trackRef} style={small ? undefined : { x: slide }}>
                {screens.map((src, i) => (
                  <figure className="pd-slide" key={src}>
                    <Browser src={src} alt={`${pro.name} ${caption(i)}`} onOpen={() => setView(src)} />
                    <figcaption>
                      <span className="mono">{pad(i + 1)}</span>
                      {caption(i)}
                    </figcaption>
                  </figure>
                ))}
              </motion.div>
              <div className="wrap">
                <div className="pd-progress" aria-hidden="true">
                  <motion.i style={{ scaleX: galP }} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ---------- next project ---------- */}
        {project.length > 1 && (
          <a
            className="panel pd-next"
            data-theme="dark"
            href={`/detail/${next.id}`}
            onClick={go(`/detail/${next.id}`)}
            data-cursor="Next case →"
          >
            <div className="wrap">
              <span className="mono">Next case study</span>
              <h2>{next.name}</h2>
            </div>
            <div className="pd-peek">
              <span className="browser-bar" aria-hidden="true"><i /><i /><i /></span>
              <img src={next.img} alt="" loading="lazy" />
            </div>
          </a>
        )}

        <div className="wrap pd-end">
          <span className="mono">© {new Date().getFullYear()} Anghel · Philippines</span>
          <a className="mono" href="/#contact" onClick={go("/#contact")}>Start a project →</a>
        </div>

        {/* ---------- full-size view ---------- */}
        {view && (
          <div className="pd-lightbox" onClick={() => setView(null)} role="dialog" aria-label="Full-size screenshot">
            <img src={view} alt="" onClick={(e) => e.stopPropagation()} />
            <button type="button" className="pd-close mono" onClick={() => setView(null)}>
              Close ✕
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export default Detail;
