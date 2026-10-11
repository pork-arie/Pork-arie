import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "../components/Reveal";
import { EASE } from "../components/motion";
import { testimonials } from "../data/data";
import "../css/testimonials.css";

const EVERY = 5000;

// One big quote at a time, switching every few seconds.
// Hidden until testimonials in data.jsx has at least one entry.
function Testimonials() {
  const [i, setI] = useState(0);
  const count = testimonials.length;

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % count), EVERY);
    return () => clearInterval(id);
  }, [count]);

  if (!count) return null;
  const t = testimonials[i];

  return (
    <section className="sec panel" id="testimonials" data-theme="dark">
      <div className="wrap">
        <Reveal className="label">
          <span className="mono">(06) — Kind words</span>
        </Reveal>
        <div className="tm-stage">
          <AnimatePresence mode="wait">
            <motion.figure
              key={i}
              className="tm-quote"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <b>{t.name}</b>
                {t.business && <span className="mono">{t.business}</span>}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        {count > 1 && (
          <div className="tm-dots">
            {testimonials.map((q, n) => (
              <button
                type="button"
                key={q.name}
                className={n === i ? "on" : ""}
                onClick={() => setI(n)}
                aria-label={`Show quote ${n + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Testimonials;
