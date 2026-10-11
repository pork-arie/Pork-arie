import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CursorGrid from "../components/CursorGrid";
import { EASE } from "../components/motion";
import "../css/hero.css";

const NAME = "ANGHEL";

// Live time in Manila for the info row ("MNL 21:14:05")
function useManilaClock() {
  const read = () =>
    new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Manila" });
  const [time, setTime] = useState(read);
  useEffect(() => {
    const id = setInterval(() => setTime(read()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function Front() {
  const time = useManilaClock();
  const fade = (delay) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: EASE, delay },
  });

  return (
    <section className="front" id="front" data-theme="light">
      {/* the original white background + cursor grid, kept as is */}
      <CursorGrid color="#0A122A" gridOpacity={0.06} />
      <div className="front-aura" aria-hidden="true" />

      <div className="wrap front-inner">
        <motion.div className="front-meta" {...fade(0.2)}>
          <span className="mono">Web developer</span>
          <span className="mono hide-sm">Systems for small businesses</span>
          <span className="mono hide-sm">Based in the Philippines</span>
          <span className="mono">MNL {time}</span>
        </motion.div>

        {/* each letter slides up out of its own mask */}
        <h1 className="name" aria-label={NAME}>
          {[...NAME].map((ch, i) => (
            <span className="mask" key={i} aria-hidden="true">
              <motion.span
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.3, ease: EASE, delay: 0.25 + i * 0.06 }}
              >
                {ch}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="front-bottom">
          <motion.p className="front-tagline" {...fade(0.75)}>
            I build web <em>systems</em> for small businesses that hold up with real users.
          </motion.p>
          <motion.div className="front-cta" {...fade(0.9)}>
            <a href="#work" className="btn">See my work</a>
            <a href="#contact" className="btn primary">
              Start a project <span className="arr">→</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Front;
