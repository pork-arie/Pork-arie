import { useEffect, useRef, useState } from "react";

// Custom cursor: a small dot that inverts over light/dark, grows into a ring
// over links, and into a labelled circle over anything with data-cursor="…".
// Only runs on devices with a real mouse; touch devices keep the normal UI.
function Cursor() {
  const ref = useRef(null);
  const [label, setLabel] = useState("");
  const [mode, setMode] = useState("");

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");

    const move = (e) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      const labelled = e.target.closest?.("[data-cursor]");
      const link = e.target.closest?.("a, button, [role='button']");
      if (labelled) {
        setLabel(labelled.dataset.cursor);
        setMode("is-label");
      } else {
        setMode(link ? "is-link" : "");
      }
    };
    // what's under the pointer changes while scrolling, so reset until it moves
    const scroll = () => setMode("");

    window.addEventListener("mousemove", move);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("scroll", scroll);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div className={`cursor ${mode}`} ref={ref} aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}

export default Cursor;
