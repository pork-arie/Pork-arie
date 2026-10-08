import { useCallback, useEffect, useRef, useState } from "react";
import "./Mascot.css";

// "Cat in a Fish Suit" — a draggable mascot whose eyes follow the cursor.
// Drag it anywhere, click it to make it react. Position is remembered.

const STORAGE_KEY = "mascot-pos";
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
  const catEyesRef = useRef([]);
  const fishEyesRef = useRef([]);
  const drag = useRef(null);
  const msgTimer = useRef(null);

  const height = size * 1.2;
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
  const [mood, setMood] = useState(null); // "happy" while reacting to a click
  const [message, setMessage] = useState(null);

  // Keep it on screen when the window resizes.
  useEffect(() => {
    const onResize = () => setPos((p) => clamp(p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp]);

  // Eyes follow the pointer (direct DOM updates, no re-render per move).
  useEffect(() => {
    const look = (e) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * 0.42);
      const dist = Math.hypot(dx, dy) || 1;
      const pull = Math.min(dist / 200, 1);
      const nx = (dx / dist) * pull;
      const ny = (dy / dist) * pull;
      catEyesRef.current.forEach((g) => {
        if (g) g.style.transform = `translate(${nx * 5}px, ${ny * 4}px)`;
      });
      fishEyesRef.current.forEach((g) => {
        if (g) g.style.transform = `translate(${nx * 6}px, ${ny * 6}px)`;
      });
    };
    window.addEventListener("pointermove", look);
    return () => window.removeEventListener("pointermove", look);
  }, []);

  useEffect(() => () => clearTimeout(msgTimer.current), []);

  const react = () => {
    setMood("happy");
    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => {
      setMood(null);
      setMessage(null);
    }, 2200);
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
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

  const classes = ["mascot", dragging && "is-dragging", mood && `is-${mood}`]
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
      {mood === "happy" && (
        <span className="mascot-heart" aria-hidden="true">
          💙
        </span>
      )}

      <div className="mascot-bob">
        <svg
          className="mascot-svg"
          viewBox="0 0 200 240"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <radialGradient id="mascot-suit" cx="40%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#4a5cc4" />
              <stop offset="100%" stopColor="#25348a" />
            </radialGradient>
            <radialGradient id="mascot-face" cx="45%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#fffaf1" />
              <stop offset="100%" stopColor="#f3e6d2" />
            </radialGradient>
          </defs>

          {/* shadow */}
          <ellipse className="mascot-shadow" cx="100" cy="232" rx="48" ry="6" />

          {/* fish tail */}
          <g className="mascot-tail">
            <path
              d="M62 196 C40 192 22 176 14 160 C30 166 40 168 46 170 C36 182 34 196 36 214 C46 206 54 202 64 204 Z"
              fill="#5d72dc"
              stroke="#3f52b8"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </g>

          {/* feet */}
          <ellipse cx="80" cy="222" rx="16" ry="10" fill="#2b3a94" />
          <ellipse cx="120" cy="222" rx="16" ry="10" fill="#2b3a94" />

          {/* body */}
          <ellipse cx="100" cy="186" rx="46" ry="38" fill="url(#mascot-suit)" />
          <ellipse cx="102" cy="194" rx="27" ry="24" fill="#7389e6" />
          <g fill="none" stroke="#b9c6f6" strokeWidth="2.4" strokeLinecap="round">
            <path d="M86 186 q4 -4 8 0 t8 0 t8 0 t8 0" />
            <path d="M86 196 q4 -4 8 0 t8 0 t8 0 t8 0" />
            <path d="M88 206 q4 -4 8 0 t8 0 t8 0" />
          </g>

          {/* dorsal fin */}
          <path
            d="M86 42 C90 22 100 10 112 4 C114 18 116 30 120 42 Z"
            fill="#3d4fb5"
          />

          {/* fish-eye ears */}
          {[
            { cx: 48, cy: 52 },
            { cx: 152, cy: 52 },
          ].map(({ cx, cy }, i) => (
            <g key={cx}>
              <circle cx={cx} cy={cy} r="26" fill="url(#mascot-suit)" />
              <circle cx={cx} cy={cy} r="18" fill="#fff" />
              <g
                className="mascot-pupil"
                ref={(el) => (fishEyesRef.current[i] = el)}
              >
                <circle cx={cx} cy={cy} r="10" fill="#141c4a" />
                <circle cx={cx + 3} cy={cy - 4} r="3.5" fill="#fff" />
              </g>
            </g>
          ))}

          {/* hood */}
          <circle cx="100" cy="108" r="72" fill="url(#mascot-suit)" />
          <circle cx="100" cy="46" r="4.5" fill="#8fa2ee" />
          <circle cx="100" cy="58" r="3.5" fill="#8fa2ee" />

          {/* gills */}
          <g fill="none" stroke="#1f2c78" strokeWidth="3" strokeLinecap="round" opacity="0.6">
            <path d="M38 112 q-4 12 0 24" />
            <path d="M46 116 q-4 10 0 20" />
            <path d="M162 112 q4 12 0 24" />
            <path d="M154 116 q4 10 0 20" />
          </g>

          {/* face */}
          <ellipse cx="100" cy="122" rx="50" ry="44" fill="url(#mascot-face)" />

          {/* blush */}
          <ellipse cx="68" cy="138" rx="10" ry="6" fill="#f7a9b3" opacity="0.7" />
          <ellipse cx="132" cy="138" rx="10" ry="6" fill="#f7a9b3" opacity="0.7" />

          {/* cat eyes */}
          <g className="mascot-eyes">
            {[78, 122].map((cx, i) => (
              <g key={cx}>
                <g className="mascot-eye-open">
                  <ellipse cx={cx} cy="120" rx="11" ry="12.5" fill="#1a2156" />
                  <g
                    className="mascot-pupil"
                    ref={(el) => (catEyesRef.current[i] = el)}
                  >
                    <circle cx={cx + 3} cy="115" r="4.5" fill="#fff" />
                    <circle cx={cx - 4} cy="125" r="1.8" fill="#fff" />
                  </g>
                </g>
                <path
                  className="mascot-eye-happy"
                  d={`M${cx - 10} 122 q10 -12 20 0`}
                  fill="none"
                  stroke="#1a2156"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>

          {/* nose + mouth */}
          <path d="M96 134 h8 l-4 4 z" fill="#f18c9b" strokeLinejoin="round" />
          <path
            d="M90 140 q5 6 10 0 q5 6 10 0"
            fill="none"
            stroke="#3b2a2a"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path className="mascot-tongue" d="M94 143 q6 10 12 0 z" fill="#f47a8c" />

          {/* whiskers */}
          <g stroke="#9b8f86" strokeWidth="1.6" strokeLinecap="round">
            <path d="M58 128 l-12 -2" />
            <path d="M58 133 l-12 2" />
            <path d="M142 128 l12 -2" />
            <path d="M142 133 l12 2" />
          </g>

          {/* paws */}
          <g className="mascot-paws">
            <circle cx="76" cy="166" r="14" fill="#34449f" />
            <circle cx="124" cy="166" r="14" fill="#34449f" />
          </g>
        </svg>
      </div>
    </div>
  );
}
