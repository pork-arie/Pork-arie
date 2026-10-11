import { useEffect, useRef, useState } from "react";
import Reveal from "../components/Reveal";
import { certificates } from "../data/data";
import "../css/certificates.css";

const pad = (n) => String(n).padStart(2, "0");

// Certificates as an index list. On a mouse, hovering a row shows a preview
// of the certificate that trails the cursor; clicking opens it full size.
// On phones each row shows the image directly.
function Certificates() {
  const [hovered, setHovered] = useState(null);
  const [open, setOpen] = useState(null);
  const previewRef = useRef(null);

  // the preview eases toward the cursor and tilts a little while it moves
  useEffect(() => {
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const move = (e) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      const tilt = Math.max(-6, Math.min(6, (tx - x) * 0.08));
      if (previewRef.current) {
        previewRef.current.style.transform = `translate(${x + 28}px, ${y - 120}px) rotate(${tilt}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", move);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Esc closes the full-size view
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section className="sec" id="certs" data-theme="light">
      <div className="wrap">
        <Reveal className="label">
          <span className="mono">(04) — Certificates</span>
        </Reveal>
        <Reveal className="sec-head">
          <h2 className="big-h">Always <em>learning.</em></h2>
          <p className="mono">{certificates.length} certificates · hover to preview</p>
        </Reveal>

        <div className="certs">
          {certificates.map((cert, i) => (
            <Reveal key={cert.id} delay={i * 0.06} y={24}>
              <button
                type="button"
                className="cert"
                onMouseEnter={() => setHovered(cert)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  setOpen(cert);
                  setHovered(null);
                }}
              >
                <span className="mono">{pad(i + 1)}</span>
                <span className="cert-name">{cert.name}</span>
                <span className="cert-issuer">{cert.issuer ?? cert.description}</span>
                <img className="cert-thumb" src={cert.img} alt="" loading="lazy" />
                <span className="cert-view">
                  View <i aria-hidden="true">↗</i>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <div className={`cert-preview${hovered ? " on" : ""}`} ref={previewRef} aria-hidden="true">
        {hovered && <img src={hovered.img} alt="" />}
      </div>

      {open && (
        <div className="cert-lightbox" onClick={() => setOpen(null)} role="dialog" aria-label={open.name}>
          <img src={open.img} alt={open.name} onClick={(e) => e.stopPropagation()} />
          <button type="button" className="cert-close mono" onClick={() => setOpen(null)}>
            Close ✕
          </button>
        </div>
      )}
    </section>
  );
}

export default Certificates;
