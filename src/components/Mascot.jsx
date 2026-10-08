import { useCallback, useEffect, useRef, useState } from "react";
import baseImg from "../assets/mascot/base.webp";
import tailImg from "../assets/mascot/tail.webp";
import pawImg from "../assets/mascot/paw.webp";
import eyeLImg from "../assets/mascot/eyeL.webp";
import eyeRImg from "../assets/mascot/eyeR.webp";
import pupilLImg from "../assets/mascot/pupilL.webp";
import pupilRImg from "../assets/mascot/pupilR.webp";
import mouthImg from "../assets/mascot/mouth.webp";
import walkImg from "../assets/mascot/anim/walk.webp";
import runImg from "../assets/mascot/anim/run.webp";
import jumpImg from "../assets/mascot/anim/jump.webp";
import fallImg from "../assets/mascot/anim/fall.webp";
import rollImg from "../assets/mascot/anim/roll.webp";
import waveImg from "../assets/mascot/anim/wave.webp";
import danceImg from "../assets/mascot/anim/dance.webp";
import lookImg from "../assets/mascot/anim/look.webp";
import sleepImg from "../assets/mascot/anim/sleep.webp";
import happyImg from "../assets/mascot/anim/happy.webp";
import sadImg from "../assets/mascot/anim/sad.webp";
import angryImg from "../assets/mascot/anim/angry.webp";
import surprisedImg from "../assets/mascot/anim/surprised.webp";
import celebrateImg from "../assets/mascot/anim/celebrate.webp";
import "./Mascot.css";

// "Cat in a Fish Suit" mascot.
//
// Normal / happy: the original 3D artwork, split into layers so the eyes
// follow the cursor and blink, the tail wags and the paw bounces.
// Everything else plays frame-by-frame 3D sprite animations (walk, run, jump,
// fall, roll, wave, dance, look around, sleep, wake, happy, celebrate, sad,
// angry, surprised), colour-matched to the original and cross-faded.
//
// Interactions:
// - Hover: happy. Click: random reaction. Poke 5x fast: angry.
// - Rub the cursor back and forth over it: happy purr.
// - Drag it anywhere; throw it and it rolls through the air, then falls flat.
// - Cursor leaves the page: sad. Comes back far away: runs to it.
// - Fast scroll: surprised. Idle: looks around, wanders, then falls asleep.
// Position is remembered.

const STORAGE_KEY = "mascot-pos";
const VB = { w: 648, h: 868 };
const RATIO = VB.h / VB.w;
const SLEEP_AFTER = 20000;

// Layer positions in the original artwork's pixel space.
const P = {
  tail: { x: 0, y: 587, w: 181, h: 273 },
  paw: { x: 421, y: 520, w: 137, h: 133 },
  eyeL: { x: 202, y: 413, w: 111, h: 114 },
  eyeR: { x: 422, y: 355, w: 110, h: 114 },
  pupilL: { x: 75, y: 177, w: 105, h: 107 },
  pupilR: { x: 442, y: 105, w: 101, h: 103 },
  mouth: { x: 333, y: 470, w: 82, h: 55 },
};
const SCLERA = {
  L: { cx: 108.8, cy: 228.3, rx: 63, ry: 83, angle: 45 },
  R: { cx: 505.6, cy: 148.8, rx: 59, ry: 75, angle: 124 },
};

// Sprite animations: one horizontal strip of 200x300 frames per animation.
const CELL = { w: 200, h: 300 }; // frame size at size=140
const ANIMS = {
  walk: { src: walkImg, frames: 7, fps: 10 },
  run: { src: runImg, frames: 8, fps: 14 },
  jump: { src: jumpImg, frames: 6, fps: 10, once: true },
  fall: { src: fallImg, frames: 5, fps: 9, once: true },
  roll: { src: rollImg, frames: 7, fps: 14 },
  wave: { src: waveImg, frames: 6, fps: 8 },
  dance: { src: danceImg, frames: 7, fps: 8 },
  look: { src: lookImg, frames: 6, fps: 4, once: true },
  sleep: { src: sleepImg, frames: 6, fps: 5, once: true },
  wake: { src: sleepImg, frames: 6, fps: 8, once: true, reverse: true },
  happy: { src: happyImg, frames: 7, fps: 9 },
  sad: { src: sadImg, frames: 7, fps: 5 },
  angry: { src: angryImg, frames: 7, fps: 8 },
  surprised: { src: surprisedImg, frames: 7, fps: 8 },
  celebrate: { src: celebrateImg, frames: 7, fps: 9 },
};

const REACTIONS = [
  { anim: "jump", ms: 1300, fx: "💙", say: ["Hi there! 👋", "Hello! 💙"] },
  { anim: "wave", ms: 1800, say: ["Need a website? 🐟", "Hire Anghel! ✨"] },
  { anim: "dance", ms: 2200, fx: "🎵", say: ["♪ Blub blub ♪", "Dance with me!"] },
  { anim: "celebrate", ms: 1800, fx: "✨", say: ["Yay! ✨", "Let's build something!"] },
  { anim: "surprised", ms: 1300, say: ["Oh! You found me! 👀"] },
  { anim: "happy", ms: 1600, fx: "💙", say: ["Boop! 💙", "Hehe~"] },
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

const Img = ({ part, href }) => (
  <image href={href} x={P[part].x} y={P[part].y} width={P[part].w} height={P[part].h} />
);

// Plays one animation strip frame by frame.
function Sprite({ anim, flip }) {
  const ref = useRef(null);
  useEffect(() => {
    const { frames, fps, once, reverse } = ANIMS[anim];
    const el = ref.current;
    let i = 0;
    const show = () => {
      const f = reverse ? frames - 1 - i : i;
      el.style.backgroundPositionX = `${(f / (frames - 1)) * 100}%`;
    };
    show();
    if (reducedMotion()) return;
    const id = setInterval(() => {
      if (once && i === frames - 1) return clearInterval(id);
      i = (i + 1) % frames;
      show();
    }, 1000 / fps);
    return () => clearInterval(id);
  }, [anim]);

  const { src, frames } = ANIMS[anim];
  return (
    <div
      ref={ref}
      className={`m-sprite${flip ? " is-flipped" : ""}`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: `${frames * 100}% 100%`,
        aspectRatio: `${CELL.w} / ${CELL.h}`,
      }}
    />
  );
}

export default function Mascot({ size = 140 }) {
  const wrapRef = useRef(null);
  const tiltRef = useRef(null);
  const eyeRefs = useRef([]);
  const pupilRefs = useRef([]);
  const posRef = useRef(null);
  const drag = useRef(null);
  const raf = useRef(0);
  const timers = useRef({});
  const lastReaction = useRef(null);
  const clicks = useRef([]);
  const angryUntil = useRef(0);
  const pet = useRef({ dir: 0, flips: [], cooldown: 0 });
  const sleepingRef = useRef(false);
  const lastMove = useRef(0);
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
  const [hovering, setHovering] = useState(false);
  const [moving, setMoving] = useState(null); // { anim: "walk" | "run", dir: -1 | 1 }
  const [action, setAction] = useState(null); // body animation { name, key }
  const [override, setOverride] = useState(null); // timed sprite animation / "happy"
  const [message, setMessage] = useState(null);
  const [particles, setParticles] = useState([]);

  // What to show right now: a sprite animation name, or "neutral"/"happy"
  // for the layered 3D artwork.
  const state =
    moving?.anim ??
    (flying ? "roll" : dragging ? "surprised" : null) ??
    override ??
    (sleeping ? "sleep" : hovering ? "happy" : "neutral");
  const anim = ANIMS[state] ? state : null;

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
      2400 + count * 90,
    );
  }, []);

  const say = useCallback((text, ms = 2200) => {
    setMessage(text);
    clearTimeout(timers.current.say);
    timers.current.say = setTimeout(() => setMessage(null), ms);
  }, []);

  // Play a reaction: sprite animation (or 3D mood) + body motion + bubble + emoji.
  const react = useCallback(
    (show, act, ms, { text, fx, count } = {}) => {
      if (show) {
        setOverride(show);
        clearTimeout(timers.current.override);
        timers.current.override = setTimeout(() => setOverride(null), ms);
      }
      if (act) {
        setAction({ name: act, key: Date.now() });
        clearTimeout(timers.current.action);
        timers.current.action = setTimeout(() => setAction(null), ms);
      }
      if (text) say(text, Math.max(ms, 1800));
      if (fx) burst(fx, count);
    },
    [say, burst],
  );

  const randomReaction = () => {
    const options = REACTIONS.filter((r) => r !== lastReaction.current);
    const r = pick(options);
    lastReaction.current = r;
    react(r.anim ?? "happy", r.act, r.ms, { text: pick(r.say), fx: r.fx });
  };

  // Walk or run along the screen to x.
  const moveTo = useCallback(
    (targetX, how, text) => {
      const tx = clamp({ x: targetX, y: 0 }).x;
      const from = posRef.current;
      if (reducedMotion() || Math.abs(tx - from.x) < 40) return;
      cancelAnimationFrame(raf.current);
      const dir = tx > from.x ? 1 : -1;
      const speed = how === "run" ? 6 : 2.2;
      setMoving({ anim: how, dir });
      setOverride(null);
      if (text) say(text, 1600);
      let x = from.x;
      const step = () => {
        x += dir * speed;
        const done = dir > 0 ? x >= tx : x <= tx;
        if (done) x = tx;
        setPos(clamp({ x, y: posRef.current.y }));
        if (done) {
          raf.current = 0;
          setMoving(null);
          save(posRef.current);
          return;
        }
        raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    },
    [clamp, setPos, say],
  );

  // Point the eyes at a screen position (3D artwork only).
  const lookAt = useCallback((clientX, clientY) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = clientX - (r.left + r.width / 2);
    const dy = clientY - (r.top + r.height * 0.4);
    const dist = Math.hypot(dx, dy) || 1;
    const pull = Math.min(dist / 250, 1);
    const nx = (dx / dist) * pull;
    const ny = (dy / dist) * pull;
    eyeRefs.current.forEach((g) => {
      if (g) g.style.transform = `translate(${nx * 9}px, ${ny * 7}px)`;
    });
    pupilRefs.current.forEach((g) => {
      if (g) g.style.transform = `translate(${nx * 14}px, ${ny * 14}px)`;
    });
    if (tiltRef.current) {
      const tx = Math.max(-1, Math.min(1, dx / 500));
      const ty = Math.max(-1, Math.min(1, dy / 500));
      tiltRef.current.style.transform = `perspective(700px) rotateY(${tx * 12}deg) rotateX(${-ty * 8}deg)`;
    }
  }, []);

  // Preload the animation strips so the first play doesn't flash blank.
  useEffect(() => {
    const id = setTimeout(() => {
      Object.values(ANIMS).forEach(({ src }) => {
        new Image().src = src;
      });
    }, 1500);
    return () => clearTimeout(id);
  }, []);

  // Keep it on screen when the window resizes.
  useEffect(() => {
    const onResize = () => setPos(clamp(posRef.current));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp, setPos]);

  // Blink at random intervals; glance around when the cursor is still.
  useEffect(() => {
    let blinkT;
    let lookT;
    const blink = () => {
      const el = wrapRef.current;
      if (el) {
        el.classList.add("is-blinking");
        setTimeout(() => el.classList.remove("is-blinking"), 160);
      }
      blinkT = setTimeout(blink, 2000 + Math.random() * 3500);
    };
    const glance = () => {
      if (Date.now() - lastMove.current > 2500) {
        const r = wrapRef.current?.getBoundingClientRect();
        if (r) {
          const a = Math.random() * Math.PI * 2;
          lookAt(r.left + r.width / 2 + Math.cos(a) * 300, r.top + Math.sin(a) * 300);
        }
      }
      lookT = setTimeout(glance, 1800 + Math.random() * 2500);
    };
    blinkT = setTimeout(blink, 1500);
    lookT = setTimeout(glance, 3000);
    return () => {
      clearTimeout(blinkT);
      clearTimeout(lookT);
    };
  }, [lookAt]);

  // Follow the pointer, sleep when idle, wake on activity, get sad when the
  // cursor leaves the page, react to fast scrolling.
  useEffect(() => {
    const wake = () => {
      if (sleepingRef.current) {
        sleepingRef.current = false;
        setSleeping(false);
        react("wake", null, 900, { text: "Huh?! I'm awake! 👀" });
      }
      clearTimeout(timers.current.sleep);
      timers.current.sleep = setTimeout(() => {
        if (drag.current || raf.current) return;
        sleepingRef.current = true;
        setSleeping(true);
        setOverride(null);
        clearTimeout(timers.current.say);
        setMessage("Zzz... 💤");
      }, SLEEP_AFTER);
    };

    const onMove = (e) => {
      lastMove.current = Date.now();
      wake();
      lookAt(e.clientX, e.clientY);
    };

    let left = false;
    const onOut = (e) => {
      if (e.relatedTarget || drag.current || sleepingRef.current) return;
      left = true;
      react("sad", null, 4000, { text: "Don't leave! 🥺" });
    };
    const onOver = (e) => {
      if (!left) return;
      left = false;
      const r = wrapRef.current?.getBoundingClientRect();
      if (r && Math.abs(e.clientX - (r.left + r.width / 2)) > 250) {
        moveTo(e.clientX - r.width / 2, "run", "Wait for me! 💨");
      } else {
        react("celebrate", null, 1600, { text: "Yay, you're back! 💙", fx: "💙" });
      }
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
        react("surprised", dy > 0 ? "hold-down" : "hold-up", 900, {
          fx: "💦",
          count: 2,
        });
      }
    };

    wake();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", wake);
    window.addEventListener("keydown", wake);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mouseover", onOver);
    };
  }, [react, lookAt, moveTo]);

  // While idle: now and then look around, or walk somewhere new
  // (toward the cursor if it's far away).
  useEffect(() => {
    let pointerX = null;
    const track = (e) => (pointerX = e.clientX);
    let next = Date.now() + 8000;
    const id = setInterval(() => {
      if (Date.now() < next) return;
      next = Date.now() + 9000 + Math.random() * 9000;
      if (sleepingRef.current || drag.current || raf.current) return;
      const r = wrapRef.current?.getBoundingClientRect();
      if (!r) return;
      if (Math.random() < 0.5) {
        react("look", null, 1600);
        return;
      }
      const far = pointerX !== null && Math.abs(pointerX - r.left) > 300;
      const target = far
        ? pointerX - r.width / 2
        : r.left + (Math.random() < 0.5 ? -1 : 1) * (150 + Math.random() * 250);
      moveTo(target, "walk", pick(["Exploring~ 🐟", "La la la ♪", null]));
    }, 1000);
    window.addEventListener("pointermove", track);
    return () => {
      clearInterval(id);
      window.removeEventListener("pointermove", track);
    };
  }, [react, moveTo]);

  // Zzz while sleeping.
  useEffect(() => {
    if (!sleeping) return;
    const id = setInterval(() => burst("💤", 1), 1800);
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
        react(null, "bonk", 350, { fx: "💫", count: 1 });
      }
      setPos({ x, y });
      if (y >= maxY && vy === 0 && Math.abs(vx) < 0.4) {
        raf.current = 0;
        setFlying(false);
        save({ x, y });
        react("fall", null, 1400, {
          text: pick(["Oof! 😵", "Again! Again!", "That was fun!"]),
          fx: "💫",
          count: 2,
        });
        timers.current.getup = setTimeout(
          () => react("jump", null, 900, { fx: "✨", count: 2 }),
          1300,
        );
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const onClick = () => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 1500), now];
    if (clicks.current.length >= 5 || now < angryUntil.current) {
      clicks.current = [];
      angryUntil.current = now + 1800;
      react("angry", "shake", 1800, { text: "Hey! Stop poking me! 💢" });
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
    setMoving(null);
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
        react("happy", null, 1800, { text: "Purrr~ 💙", fx: "💙", count: 5 });
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
      setOverride(null);
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
    // Only the motion right before release counts (pause, then let go = drop).
    const now = performance.now();
    const recent = d.samples.filter((s) => now - s.t < 80);
    const first = recent[0] ?? d.samples[d.samples.length - 1];
    const last = recent[recent.length - 1] ?? first;
    const frame = 16 / Math.max(last.t - first.t, 1);
    const vx = Math.max(-45, Math.min(45, (last.x - first.x) * frame));
    const vy = Math.max(-45, Math.min(45, (last.y - first.y) * frame));
    if (Math.hypot(vx, vy) > 10 && !reducedMotion()) {
      say(pick(["Wheeee! 🚀", "Aaaah! 😱", "I can fly! 🐟"]), 1200);
      fling(vx, vy);
    } else {
      save(posRef.current);
      react("jump", null, 800);
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
    `mood-${state}`,
    anim && "is-sprite",
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
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
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
            {anim ? (
              <Sprite key={anim} anim={anim} flip={moving?.dir < 0} />
            ) : (
              <svg
                className="mascot-svg"
                viewBox={`0 0 ${VB.w} ${VB.h}`}
                aria-hidden="true"
                focusable="false"
              >
                <defs>
                  {Object.entries(SCLERA).map(([k, s]) => (
                    <clipPath id={`mascot-sclera-${k}`} key={k}>
                      <ellipse
                        cx={s.cx}
                        cy={s.cy}
                        rx={s.rx}
                        ry={s.ry}
                        transform={`rotate(${s.angle} ${s.cx} ${s.cy})`}
                      />
                    </clipPath>
                  ))}
                </defs>

                <g className="m-tail">
                  <Img part="tail" href={tailImg} />
                </g>
                <image href={baseImg} x="0" y="0" width={VB.w} height={VB.h} />

                {/* fish-suit eyes: pupils follow the cursor */}
                {[
                  ["L", "pupilL", pupilLImg],
                  ["R", "pupilR", pupilRImg],
                ].map(([k, part, href], i) => (
                  <g clipPath={`url(#mascot-sclera-${k})`} key={k}>
                    <g className="m-track" ref={(el) => (pupilRefs.current[i] = el)}>
                      <Img part={part} href={href} />
                    </g>
                  </g>
                ))}

                {/* cat eyes: follow the cursor and blink */}
                {[
                  ["eyeL", eyeLImg],
                  ["eyeR", eyeRImg],
                ].map(([part, href], i) => (
                  <g className="m-track" key={part} ref={(el) => (eyeRefs.current[i] = el)}>
                    <g className="m-eye">
                      <Img part={part} href={href} />
                    </g>
                  </g>
                ))}

                {state === "happy" && (
                  <g className="m-line" fill="none">
                    <path d="M214 482 Q257 428 300 482" />
                    <path d="M434 424 Q477 370 520 424" />
                  </g>
                )}
                <Img part="mouth" href={mouthImg} />

                <g className="m-paw">
                  <Img part="paw" href={pawImg} />
                </g>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
