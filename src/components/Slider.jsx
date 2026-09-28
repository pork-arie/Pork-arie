import { useCallback, useEffect, useRef, useState } from "react";

/*
  Horizontal slider used by Projects and Certificates.
  - Touch: native swipe (smooth, with momentum) + scroll-snap.
  - Mouse: click-and-drag. Snap is paused while dragging, then we
    glide to the nearest card on release so it doesn't jump.
  - Arrows move exactly one card and disable at the start/end.
  - A thin progress bar shows where you are, since the scrollbar is hidden.
*/
function Slider({ children, label, className = "" }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [progress, setProgress] = useState(0);
  const [overflowing, setOverflowing] = useState(false);

  // --- state of the arrows + progress bar ---
  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setOverflowing(max > 2);
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft < max - 2);
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    // re-check when the track or its cards change size (images loading, resize)
    const ro = new ResizeObserver(update);
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update, children]);

  // --- helpers ---
  const cardStarts = () => {
    const el = trackRef.current;
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    const max = el.scrollWidth - el.clientWidth;
    return Array.from(el.children).map((c) =>
      Math.min(Math.max(c.offsetLeft - pad, 0), max),
    );
  };

  const step = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const starts = cardStarts();
    const x = el.scrollLeft;
    const target =
      dir > 0
        ? starts.find((s) => s > x + 4) ?? el.scrollWidth
        : [...starts].reverse().find((s) => s < x - 4) ?? 0;
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  // --- mouse drag (touch uses native scrolling) ---
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0 });

  const onPointerDown = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = trackRef.current;
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startLeft: el.scrollLeft,
      id: e.pointerId,
    };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const el = trackRef.current;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 5) {
      // only start "dragging" after a real move, so normal clicks still work
      d.moved = true;
      el.classList.add("is-dragging");
      el.setPointerCapture?.(d.id);
    }
    if (d.moved) el.scrollLeft = d.startLeft - dx;
  };

  const endDrag = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    const el = trackRef.current;
    if (!d.moved) return;
    el.releasePointerCapture?.(d.id);

    // glide to the closest card, nudged in the direction you dragged
    const dir = Math.sign(d.startLeft - el.scrollLeft); // + = moved forward
    const x = el.scrollLeft + dir * 40;
    const starts = cardStarts();
    const target = starts.reduce((a, b) =>
      Math.abs(b - x) < Math.abs(a - x) ? b : a,
    );
    el.classList.remove("is-dragging");
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  // stop the click that fires right after a drag from opening a card
  const onClickCapture = (e) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div className={`slider ${className}`}>
      <div
        ref={trackRef}
        className="slider-track"
        role="region"
        aria-label={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        {children}
      </div>

      {overflowing && (
        <div className="slider-controls">
          <button
            type="button"
            className="nav-arrow left"
            onClick={() => step(-1)}
            disabled={!canPrev}
            aria-label={`Previous ${label}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <div className="slider-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${Math.max(progress, 0.04)})` }} />
          </div>

          <button
            type="button"
            className="nav-arrow right"
            onClick={() => step(1)}
            disabled={!canNext}
            aria-label={`Next ${label}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default Slider;