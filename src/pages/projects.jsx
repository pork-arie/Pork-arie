import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { certificates, project } from "../data/data.jsx";
import { useNavigate } from "react-router-dom";

function Projects() {
  const [show, setShow] = useState("proj");
  const scrollRef = useRef(null);
  const sRef = useRef(null);
  const nav = useNavigate();

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 350, behavior: "smooth" });
  };

  const sLeft = () => {
    sRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  };
  const sRight = () => {
    sRef.current?.scrollBy({ left: 350, behavior: "smooth" });
  };

  const [sel, setSel] = useState(null);

  const [showProjArrows, setShowProjArrows] = useState(false);
  const [showCertArrows, setShowCertArrows] = useState(false);

  // Track whether we're on a small (tablet/mobile) screen
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsSmallScreen(window.innerWidth <= 1024);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Arrows show if screen is small OR there are enough items to need scrolling
  useEffect(() => {
    const checkArrows = () => {
      setShowProjArrows(isSmallScreen || project.length > 1);
      setShowCertArrows(isSmallScreen || certificates.length > 1);
    };

    const timeout = setTimeout(checkArrows, 100);
    window.addEventListener("resize", checkArrows);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", checkArrows);
    };
  }, [show, project.length, certificates.length, isSmallScreen]);

  // Mouse drag-to-scroll for the certificate list (desktop mouse users)
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const handleMouseDown = (e) => {
    isDown.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };
  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

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
              <div className="slider-wrapper">
                {showProjArrows && (
                  <button className="nav-arrow left" onClick={sLeft}></button>
                )}
                <motion.div className="projlist" ref={sRef}>
                  {project.map((pro) => (
                    <div className="projCard" key={pro.id}>
                      <img src={pro.img} loading="lazy" />
                      <h2>{pro.name}</h2>

                      <button
                        className="check"
                        onClick={() => nav(`/detail/${pro.id}`)}
                      >
                        Details
                      </button>
                    </div>
                  ))}
                </motion.div>
                {showProjArrows && (
                  <button className="nav-arrow right" onClick={sRight}></button>
                )}
              </div>
            ) : (
              <div className="slider-wrapper">
                {showCertArrows && (
                  <button
                    className="nav-arrow left"
                    onClick={scrollLeft}
                  ></button>
                )}

                <div
                  className="certlist"
                  ref={scrollRef}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                >
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

                {showCertArrows && (
                  <button
                    className="nav-arrow right"
                    onClick={scrollRight}
                  ></button>
                )}
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