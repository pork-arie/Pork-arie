import { useCallback, useEffect, useRef, useState } from "react";
import mascotImg from "../assets/mascot.webp";
import "./Mascot.css";

// "Cat in a Fish Suit" — an interactive mascot.
// - Leans toward the cursor, perks up on hover
// - Click: random reaction (jump, spin, dance, flip, wave...)
// - Double-click: spin with sparkles; click spam: gets dizzy
// - Rub the cursor back and forth over it: purrs
// - Drag it anywhere; throw it and it bounces off the screen edges
// - Leave it alone and it falls asleep; move the mouse to wake it
// - Reacts when the page is scrolled fast
// Position is remembered between visits.

const STORAGE_KEY = "mascot-pos";
const RATIO = 563 / 420; // height / width of mascot.webp
const SLEEP_AFTER = 15000;

const REACTIONS = [
  { name: "jump", ms: 1100, fx: "💙", say: ["Hi there! 👋", "Hello! 💙"] },
  { name: "spin", ms: 900, fx: "✨", say: ["Wheee! 🌀"] },
  { name: "dance", ms: 1700, fx: "🎵", say: ["♪ Blub blub ♪", "Dance with me!"] },
  { name: "flip", ms: 1000, fx: "✨", say: ["Ta-da! ✨"] },
  { name: "shake", ms: 800, fx: "😆", say: ["Hehe, that tickles!"] },
  { name: "squish", ms: 900, fx: "💙", say: ["Squish!", "Boop! 💙"] },
  {
    name: "wave",
    ms: 1500,
    fx: "🐟",
    say: ["Need a website? 🐟", "Hire Anghel! ✨", "Let's build something!"],
  },
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

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

const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Mascot({ size = 140 }) {
  const wrapRef = useRef(null);
  const tiltRef = useRef(null);
  const posRef = useRef(null);
  const drag = useRef(null);
  const raf = useRef(0);
  const timers = useRef({});
  const lastReaction = useRef(null);
  const clicks = useRef([]);
  const pet = useRef({ dir: 0, flips: [], cooldown: 0 });
  const sleepingRef = useRef(false);
  const particleId = useRef(0);

  const height = size * RATIO;
  const clamp = useCallback(
    ({ x, y }) => ({
      x: Math.min(Math.max(0, x), window.innerWidth - size),
      y: Math.min(Math.max(0, y), window.innerHeight - height),
    }),
    [size, height],
  );

  const [pos, setPosState] = useState(() => {
    const saved = readSaved();
    const fallback = {
      x: window.innerWidth - size - 24,
      y: window.innerHeight - height - 24,
    };
    return clamp(saved ?? fallback);
  });
  const [dragging, setDragging] = useState(false);
  const [flying, setFlying] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const [action, setAction] = useState(null); // { name, key }
  const [message, setMessage] = useState(null);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  const setPos = useCallback((p) => {
    posRef.current = p;
    setPosState(p);
  }, []);

  const burst = useCallback((emoji, count = 3) => {
    const items = Array.from({ length: count }, (_, i) => ({
      id: ++particleId.current,
      emoji,
      left: 15 + Math.random() * 70,
      dx: (Math.random() - 0.5) * 60,
      delay: i * 90,
    }));
    setParticles((ps) => [...ps, ...items]);
    const ids = new Set(items.map((p) => p.id));
    setTimeout(
      () => setParticles((ps) => ps.filter((p) => !ids.has(p.id))),
      1600 + count * 90,
    );
  }, []);

  const say = useCallback((text, ms = 2200) => {
    setMessage(text);
    clearTimeout(timers.current.say);
    timers.current.say = setTimeout(() => setMessage(null), ms);
  }, []);

  const play = useCallback(
    (name, ms, { text, fx, count } = {}) => {
      setAction({ name, key: Date.now() });
      clearTimeout(timers.current.action);
      timers.current.action = setTimeout(() => setAction(null), ms);
      if (text) say(text, Math.max(ms, 1800));
      if (fx) burst(fx, count);
    },
    [say, burst],
  );

  const randomReaction = () => {
    const options = REACTIONS.filter((r) => r.name !== lastReaction.current);
    const r = pick(options);
    lastReaction.current = r.name;
    play(r.name, r.ms, { text: pick(r.say), fx: r.fx });
  };

  // Keep it on screen when the window resizes.
  useEffect(() => {
    const onResize = () => setPos(clamp(posRef.current));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp, setPos]);

  // Lean toward the pointer, fall asleep when idle, wake on activity.
  useEffect(() => {
    const wake = () => {
      if (sleepingRef.current) {
        sleepingRef.current = false;
        setSleeping(false);
        play("surprised", 700, { text: "Huh?! I'm awake! 👀", fx: "❗", count: 1 });
      }
      clearTimeout(timers.current.sleep);
      timers.current.sleep = setTimeout(() => {
        if (drag.current || raf.current) return;
        sleepingRef.current = true;
        setSleeping(true);
        clearTimeout(timers.current.say);
        setMessage("Zzz... 💤");
      }, SLEEP_AFTER);
    };

    const look = (e) => {
      wake();
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

    let lastY = window.scrollY;
    let scrollCool = 0;
    const onScroll = () => {
      wake();
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      const now = Date.now();
      if (Math.abs(dy) > 60 && now > scrollCool && !drag.current) {
        scrollCool = now + 1500;
        play(dy > 0 ? "hold-down" : "hold-up", 700, { fx: "💦", count: 2 });
      }
    };

    wake();
    window.addEventListener("pointermove", look);
    window.addEventListener("pointerdown", wake);
    window.addEventListener("keydown", wake);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", look);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("scroll", onScroll);
    };
  }, [play]);

  // Zzz while sleeping.
  useEffect(() => {
    if (!sleeping) return;
    burst("💤", 1);
    const id = setInterval(() => burst("💤", 1), 1600);
    return () => clearInterval(id);
  }, [sleeping, burst]);

  // Clean up timers / animation frame on unmount.
  useEffect(() => {
    const t = timers.current;
    return () => {
      Object.values(t).forEach(clearTimeout);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  // Throw physics: gravity, wall bounces, friction on the floor.
  const fling = (vx, vy) => {
    cancelAnimationFrame(raf.current);
    setFlying(true);
    let { x, y } = posRef.current;
    let bonkCool = 0;
    const step = () => {
      const maxX = window.innerWidth - size;
      const maxY = window.innerHeight - height;
      vy += 0.9;
      x += vx;
      y += vy;
      let impact = 0;
      if (x < 0 || x > maxX) {
        x = x < 0 ? 0 : maxX;
        impact = Math.abs(vx);
        vx = -vx * 0.6;
      }
      if (y < 0) {
        y = 0;
        impact = Math.max(impact, Math.abs(vy));
        vy = -vy * 0.6;
      }
      if (y > maxY) {
        y = maxY;
        impact = Math.max(impact, Math.abs(vy));
        vy = Math.abs(vy) < 3 ? 0 : -vy * 0.5;
        vx *= 0.85;
      }
      const now = Date.now();
      if (impact > 10 && now > bonkCool) {
        bonkCool = now + 300;
        play("bonk", 350, { fx: "💫", count: 1 });
      }
      setPos({ x, y });
      if (y >= maxY && vy === 0 && Math.abs(vx) < 0.4) {
        raf.current = 0;
        setFlying(false);
        save({ x, y });
        play("land", 600, { text: pick(["Again! Again!", "Whew! 😵", "That was fun!"]) });
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const onClick = () => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 2500), now];
    const recent = clicks.current;
    if (recent.length >= 5) {
      clicks.current = [];
      play("dizzy", 1800, { text: "I'm dizzy... 😵‍💫", fx: "💫", count: 3 });
    } else if (recent.length >= 2 && now - recent[recent.length - 2] < 300) {
      play("spin", 900, { text: "Double spin! 🌀", fx: "✨", count: 5 });
    } else {
      randomReaction();
    }
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    setFlying(false);
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: posRef.current.x,
      originY: posRef.current.y,
      moved: false,
      samples: [{ x: e.clientX, y: e.clientY, t: performance.now() }],
    };
  };

  const detectPetting = (e) => {
    if (e.pointerType !== "mouse" || e.buttons) return;
    const p = pet.current;
    const dir = Math.sign(e.movementX);
    if (!dir) return;
    const now = Date.now();
    if (p.dir && dir !== p.dir) {
      p.flips = [...p.flips.filter((t) => now - t < 1200), now];
      if (p.flips.length >= 5 && now > p.cooldown) {
        p.flips = [];
        p.cooldown = now + 2500;
        play("purr", 1400, { text: "Purrr~ 💙", fx: "💙", count: 5 });
      }
    }
    p.dir = dir;
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return detectPetting(e);
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const now = performance.now();
    d.samples = [
      ...d.samples.filter((s) => now - s.t < 80),
      { x: e.clientX, y: e.clientY, t: now },
    ];
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) {
      d.moved = true;
      setDragging(true);
      setMessage(null);
    }
    setPos(clamp({ x: d.originX + dx, y: d.originY + dy }));
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved) return onClick();
    setDragging(false);
    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const dt = Math.max(last.t - first.t, 1);
    const frame = 16 / dt;
    const vx = Math.max(-45, Math.min(45, (last.x - first.x) * frame));
    const vy = Math.max(-45, Math.min(45, (last.y - first.y) * frame));
    if (Math.hypot(vx, vy) > 10 && !reducedMotion()) {
      say(pick(["Wheeee! 🚀", "Aaaah! 😱", "I can fly! 🐟"]), 1200);
      fling(vx, vy);
    } else {
      save(posRef.current);
      play("land", 600);
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
      const next = clamp({ x: posRef.current.x + mx, y: posRef.current.y + my });
      setPos(next);
      save(next);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  const classes = [
    "mascot",
    dragging && "is-dragging",
    flying && "is-flying",
    sleeping && "is-sleeping",
    pos.y < 70 && "bubble-below",
  ]
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
      aria-label="Mascot: click, drag or throw it"
    >
      {message && (
        <div className="mascot-bubble" key={message}>
          {message}
        </div>
      )}
      {particles.map((p) => (
        <span
          key={p.id}
          className="mascot-particle"
          aria-hidden="true"
          style={{
            left: `${p.left}%`,
            "--dx": `${p.dx}px`,
            animationDelay: `${p.delay}ms`,
          }}
        >
          {p.emoji}
        </span>
      ))}
      <span className="mascot-shadow" aria-hidden="true" />
      <div
        key={action?.key}
        className={`mascot-act${action ? ` act-${action.name}` : ""}`}
      >
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
    </div>
  );
}
