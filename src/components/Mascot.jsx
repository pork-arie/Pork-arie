import { useCallback, useEffect, useRef, useState } from "react";
import mascotImg from "../assets/mascot.webp";
import "./Mascot.css";

// "Cat in a Fish Suit" — a draggable mascot that leans toward the cursor.
// Drag it anywhere, click it to make it react. Position is remembered.

const STORAGE_KEY = "mascot-pos";
const RATIO = 563 / 420; // height / width of mascot.webp
const MESSAGES = [
  "Hi there! 👋",
  "Need a website? 🐟",
  "Blub blub~",
  "Meow! 💙",
  "Let's build something!",
  "Hire Anghel! ✨",
];

const readSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const save = (pos) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {
    /* storage unavailable — ignore */
  }
};

export default function Mascot({ size = 140 }) {
  const wrapRef = useRef(null);
  const tiltRef = useRef(null);
  const drag = useRef(null);
  const msgTimer = useRef(null);

  const height = size * RATIO;
  const clamp = useCallback(
    ({ x, y }) => ({
      x: Math.min(Math.max(0, x), window.innerWidth - size),
      y: Math.min(Math.max(0, y), window.innerHeight - height),
    }),
    [size, height],
  );

  const [pos, setPos] = useState(() => {
    const saved = readSaved();
    const fallback = {
      x: window.innerWidth - size - 24,
      y: window.innerHeight - height - 24,
    };
    return clamp(saved ?? fallback);
  });
  const [dragging, setDragging] = useState(false);
  const [happy, setHappy] = useState(false);
  const [message, setMessage] = useState(null);

  // Keep it on screen when the window resizes.
  useEffect(() => {
    const onResize = () => setPos((p) => clamp(p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp]);

  // Lean toward the pointer (direct DOM update, no re-render per move).
  useEffect(() => {
    const look = (e) => {
      const el = wrapRef.current;
      const tilt = tiltRef.current;
      if (!el || !tilt) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const nx = Math.max(-1, Math.min(1, dx / 400));
      const ny = Math.max(-1, Math.min(1, dy / 400));
      tilt.style.transform = `perspective(600px) rotateY(${nx * 18}deg) rotateX(${-ny * 12}deg) rotate(${nx * 4}deg)`;
    };
    window.addEventListener("pointermove", look);
    return () => window.removeEventListener("pointermove", look);
  }, []);

  useEffect(() => () => clearTimeout(msgTimer.current), []);

  const react = () => {
    setHappy(true);
    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => {
      setHappy(false);
      setMessage(null);
    }, 2200);
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
      moved: false,
    };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) {
      d.moved = true;
      setDragging(true);
    }
    setPos(clamp({ x: d.originX + dx, y: d.originY + dy }));
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) {
      setDragging(false);
      setPos((p) => {
        save(p);
        return p;
      });
    } else {
      react();
    }
  };

  const onKeyDown = (e) => {
    const step = e.shiftKey ? 40 : 10;
    const moves = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (moves[e.key]) {
      e.preventDefault();
      const [mx, my] = moves[e.key];
      setPos((p) => {
        const next = clamp({ x: p.x + mx, y: p.y + my });
        save(next);
        return next;
      });
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      react();
    }
  };

  const classes = ["mascot", dragging && "is-dragging", happy && "is-happy"]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={wrapRef}
      className={classes}
      style={{ left: pos.x, top: pos.y, width: size, height }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Mascot: drag to move, click to say hi"
    >
      {message && <div className="mascot-bubble">{message}</div>}
      {happy && (
        <span className="mascot-heart" aria-hidden="true">
          💙
        </span>
      )}
      <span className="mascot-shadow" aria-hidden="true" />
      <div className="mascot-bob">
        <div className="mascot-tilt" ref={tiltRef}>
          <img
            className="mascot-img"
            src={mascotImg}
            alt=""
            draggable="false"
          />
        </div>
      </div>
    </div>
  );
}
