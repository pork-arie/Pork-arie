import { useEffect, useRef, useState } from "react";
import { animate, useInView, useMotionValueEvent, useScroll } from "framer-motion";
import d1 from "../assets/d1.jpg";
import peice from "../assets/piece.jpg";
import PixelTransition from "../components/pixel";
import Reveal from "../components/Reveal";
import { certificates, project, socials } from "../data/data";
import "../css/about.css";

const STATEMENT =
  "IT student and freelance developer. Most of what I know came from shipping real systems, then debugging them at 2 a.m., so the sites I build are made to survive real users and messy data.";

// Number that counts up from 0 the first time it scrolls into view
function CountUp({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);
  return <b ref={ref}>{n}{suffix}</b>;
}

function Main() {
  // the statement lights up word by word as you scroll through it
  const textRef = useRef(null);
  const words = STATEMENT.split(" ");
  const [lit, setLit] = useState(0);
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ["start 85%", "end 50%"],
  });
  useMotionValueEvent(scrollYProgress, "change", (p) =>
    setLit(Math.round(p * words.length)),
  );

  const links = [
    ["GitHub", socials.github],
    ["LinkedIn", socials.linkedin],
    ["Instagram", socials.instagram],
    ["Facebook", socials.facebook],
  ].filter(([, url]) => url);

  return (
    <section className="sec panel about" id="main" data-theme="dark">
      <div className="wrap">
        <Reveal className="label">
          <span className="mono">(01) — About</span>
        </Reveal>

        <div className="about-grid">
          <div>
            <h2 className="mono about-hello">Hello! I'm Ariel Angel</h2>
            <p className="statement" ref={textRef}>
              {words.map((w, i) => (
                <span key={i} className={i < lit ? "lit" : ""}>{w} </span>
              ))}
            </p>
            <ul className="about-links">
              {links.map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noreferrer" className="mono">
                    {name} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* hover (or tap on phones) pixel-swaps to the second photo */}
          <Reveal className="about-photo">
            <PixelTransition
              firstContent={<img src={d1} alt="Portrait of Ariel Angel Bangcale" loading="lazy" />}
              secondContent={<img src={peice} alt="" loading="lazy" />}
              gridSize={8}
              pixelColor="#0A122A"
              aspectRatio="125%"
            />
          </Reveal>
        </div>

        <div className="stats">
          <Reveal className="stat">
            <CountUp to={project.length} />
            <p className="mono">Systems shipped</p>
          </Reveal>
          <Reveal className="stat" delay={0.1}>
            <CountUp to={certificates.length} />
            <p className="mono">Certifications</p>
          </Reveal>
          <Reveal className="stat" delay={0.2}>
            <CountUp to={24} suffix="h" />
            <p className="mono">Reply time</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default Main;
