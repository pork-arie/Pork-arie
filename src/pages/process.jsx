import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import "../css/process.css";

const steps = [
  {
    num: "01",
    title: "Send an inquiry",
    desc: "Fill out the contact form below with your project idea, timeline, and budget.",
  },
  {
    num: "02",
    title: "Consultation & reply",
    desc: "I'll respond within 24 hours. We'll discuss your goals and I'll answer all your questions.",
  },
  {
    num: "03",
    title: "Execution & delivery",
    desc: "Once we agree on the scope, I start building. You get regular updates until delivery!",
  },
];

// On desktop the section stays pinned while you scroll and a line draws
// across the steps, lighting each one up as it reaches it.
function Process() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const [reached, setReached] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setReached(steps.filter((_, i) => p >= i / (steps.length - 0.4)).length);
  });

  return (
    <section className="process" id="process" ref={ref} data-theme="light">
      <div className="process-pin">
        <div className="wrap">
          <div className="label">
            <span className="mono">(05) — Process</span>
          </div>
          <h2 className="big-h">How we'll <em>work</em> together.</h2>
          <div className="process-track">
            <div className="process-rail" aria-hidden="true">
              <motion.i style={{ scaleX }} />
            </div>
            {steps.map((s, i) => (
              <div className={`process-step${i < reached ? " on" : ""}`} key={s.num}>
                <div className="process-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Process;
