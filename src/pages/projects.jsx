import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

import { certificates, project } from "../data/data.jsx";
import Slider from "../components/Slider.jsx";

function Projects() {
  const [show, setShow] = useState("proj");
  const [sel, setSel] = useState(null);
  const nav = useNavigate();
  const location = useLocation();

  // coming back from a project page ("/#proj") -> jump to this section
  useEffect(() => {
    if (location.hash === "#proj") {
      document.getElementById("proj")?.scrollIntoView();
    }
  }, [location.hash]);

  // close the certificate preview with Esc
  useEffect(() => {
    if (!sel) return;
    const onKey = (e) => e.key === "Escape" && setSel(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  return (
    <section className="proj" id="proj">
      <div className="scroll">
        <span className="big-bg-text">PROJECTS</span>
      </div>

      <motion.div
        className="bcon"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <button
          type="button"
          id="bt"
          className={show === "proj" ? "active" : ""}
          aria-pressed={show === "proj"}
          onClick={() => setShow("proj")}
        >
          PROJECTS
        </button>
        <button
          type="button"
          id="bt"
          className={show === "cert" ? "active" : ""}
          aria-pressed={show === "cert"}
          onClick={() => setShow("cert")}
        >
          CERTIFICATES
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          className="projCon"
          key={show}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {show === "proj" ? (
            <Slider label="projects">
              {project.map((pro) => (
                <div className="projCard" key={pro.id}>
                  <img src={pro.img} alt={pro.name} loading="lazy" draggable={false} />
                  <h2>{pro.name}</h2>
                  <button
                    type="button"
                    className="check"
                    onClick={() => nav(`/detail/${pro.id}`)}
                  >
                    Details
                  </button>
                </div>
              ))}
            </Slider>
          ) : (
            <Slider label="certificates">
              {certificates.map((cert) => (
                <div className="projCard" key={cert.id}>
                  <img src={cert.img} alt={cert.name} loading="lazy" draggable={false} />
                  <h2>{cert.name}</h2>
                  <p>{cert.description}</p>
                  <button
                    type="button"
                    className="check"
                    onClick={() => setSel(cert)}
                  >
                    check
                  </button>
                </div>
              ))}
            </Slider>
          )}
        </motion.div>
      </AnimatePresence>

      {sel && (
        <div className="lightbox-overlay" onClick={() => setSel(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setSel(null)}
              aria-label="Close preview"
            >
              ×
            </button>
            <img src={sel.img} alt={sel.name} />
          </div>
        </div>
      )}
    </section>
  );
}

export default Projects;