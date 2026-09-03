import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

function Process() {
  const ref = useRef(null);

  // Track the scroll progress of the entire section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"], // Starts when it enters, ends when it leaves
  });

  // Smooth out the scrolling (so it doesn't jump)
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const steps = [
    {
      num: "01",
      title: "Send an Inquiry",
      desc: "Fill out the contact form below with your project idea, timeline, and budget.",
    },
    {
      num: "02",
      title: "Consultation & Reply",
      desc: "I'll respond within 24 hours. We'll discuss your goals and I'll answer all your questions.",
    },
    {
      num: "03",
      title: "Execution & Delivery",
      desc: "Once we agree on the scope, I start building. You get regular updates until delivery!",
    },
  ];

  return (
    <section className="process-section" ref={ref}>
      <h2 className="process-title">How We Can Work Together</h2>

      <div className="process-container">
        {/* The static gray background line */}
        <div className="process-line" />
        
        {/* The animated cyan line that draws as you scroll */}
        <motion.div className="process-line-animated" style={{ scaleY }} />

        <div className="process-steps">
          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              className="process-step"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }} // Triggers when half of it is visible
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <motion.div
                className="process-dot"
                whileHover={{ scale: 1.5, boxShadow: "0 0 20px #00d8ff" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {step.num}
              </motion.div>

              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Process;