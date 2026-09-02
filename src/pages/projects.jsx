import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { certificates, project } from "../data/data.jsx";
import { Navigate, useNavigate } from "react-router-dom";

function Projects() {
  const [show, setShow] = useState("proj");
  const scrollRef = useRef(null);
  const nav = useNavigate()

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 350, behavior: "smooth" });
  };

  const [sel, setSel] = useState(null);

  return (
    <>
      <section className="proj" id="proj">
        <div className="scroll">
          <span className="big-bg-text">PROJECTS</span>
        </div>

        <motion.div
          className="bcon"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "ease" }}
        >
          <button
            id="bt"
            className={show === "proj" ? "active" : ""}
            onClick={() => setShow("proj")}
          >
            PROJECTS
          </button>
          <button
            id="bt"
            className={show === "cert" ? "active" : ""}
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
              <motion.div className="projlist">
                {project.map((pro) => (
                  <div className="projCard" key={pro.id}>
                    <img src={pro.img} loading="lazy" />
                    <h2>{pro.name}</h2>
                    
                    <button className="check" onClick={() => nav(`/detail/${pro.id}`)}>Details</button>
                  </div>
                ))}
              </motion.div>
            ) : (
              <div className="slider-wrapper">
                <button
                  className="nav-arrow left"
                  onClick={scrollLeft}
                ></button>

                <div className="certlist" ref={scrollRef}>
                  {certificates.map((prod) => (
                    <motion.div className="projCard" key={prod.id}>
                      <img src={prod.img} loading="lazy" />
                      <h2>{prod.name}</h2>
                      <p>{prod.description}</p>

                      <button className="check" onClick={() => setSel(prod)}>
                        check
                      </button>
                    </motion.div>
                  ))}
                </div>

                <button
                  className="nav-arrow right"
                  onClick={scrollRight}
                ></button>
              </div>
            )}
          </motion.div>

          {sel && (
            <div className="lightbox-overlay" onClick={() => setSel(null)}>
              <div
                className="lightbox-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="lightbox-close" onClick={() => setSel(null)}>
                  x
                </button>
                <img src={sel.img} alt={sel.name} />
              </div>
            </div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}

export default Projects;
