# How the animations and UI components work

This guide explains the techniques behind the redesign, with the real code
from this repo. Each part says **what you see**, **how it works**, and
**where the code lives**.

The libraries involved are ones the project already had:
- **framer-motion**: scroll-linked and enter animations
- **gsap**: only inside the original PixelTransition
- **plain CSS**: everything else

---

## 0. Why it feels smooth: 4 rules

Every effect follows these 4 rules. They matter more than any single trick.

1. **Use one easing curve everywhere.** When every movement speeds up and slows down the same way, the site feels designed instead of assembled.
2. **Only animate `transform` and `opacity`.** The browser can move these on the GPU without recalculating the layout, so they stay smooth even on phones. Animating `top`, `left`, `width` or `margin` causes stutter.
3. **Use long, soft durations.** Most animations take 0.6–1.3 s and start fast, then glide to a stop. Short, linear animations feel cheap.
4. **Animate each thing once.** Elements reveal the first time you scroll to them and then stay put, so scrolling back up doesn't replay everything.

---

## 1. The one easing curve

**Where:** `src/components/motion.js` and `src/index.css`

```js
// src/components/motion.js
export const EASE = [0.22, 1, 0.36, 1];
```

```css
/* src/index.css */
:root {
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}
```

These are the same curve, written once for JavaScript (framer-motion) and once for CSS. It's an "ease-out-quint": the element moves quickly at first, then slows down gently. Every animation on the site uses `EASE` or `var(--ease)`.

---

## 2. Fade up on scroll: `<Reveal>`

**What you see:** labels, headings and cards slide up 40px and fade in as they enter the screen.

**Where:** `src/components/Reveal.jsx`

```jsx
import { motion } from "framer-motion";
import { EASE } from "./motion";

function Reveal({ as = "div", delay = 0, y = 40, children, ...rest }) {
  const Tag = motion[as];               // motion.div, motion.h2, motion.form...
  return (
    <Tag
      initial={{ opacity: 0, y }}       // start: invisible, 40px lower
      whileInView={{ opacity: 1, y: 0 }}// when it's on screen: visible, in place
      viewport={{ once: true, amount: 0.15 }} // only once, when 15% is visible
      transition={{ duration: 1.1, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
```

**Use it anywhere:**
```jsx
<Reveal className="label"><span className="mono">(02) — Toolkit</span></Reveal>
<Reveal as="h2" delay={0.1}>Let's build something.</Reveal>
```

**Staggering:** give items in a list a growing `delay` so they arrive one after another:
```jsx
{certificates.map((cert, i) => (
  <Reveal key={cert.id} delay={i * 0.06} y={24}> … </Reveal>
))}
```

---

## 3. Letters sliding up out of a mask (ANGHEL, project titles)

**What you see:** each letter rises from below, as if it were hidden behind a line.

**Where:** `src/pages/front.jsx` and `src/pages/detail.jsx`

**The trick:** each letter sits inside a box with `overflow: hidden`. The letter starts at `y: 105%`, below the box where it can't be seen, and slides to `0`. Each letter starts a little later than the one before it.

```jsx
<h1 className="name" aria-label="ANGHEL">
  {[..."ANGHEL"].map((ch, i) => (
    <span className="mask" key={i} aria-hidden="true">
      <motion.span
        initial={{ y: "105%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.3, ease: EASE, delay: 0.25 + i * 0.06 }}
      >
        {ch}
      </motion.span>
    </span>
  ))}
</h1>
```

```css
.name .mask        { display: inline-block; overflow: hidden; padding-top: 0.08em; }
.name .mask > span { display: inline-block; }
```

`aria-label` on the `<h1>` lets screen readers read "ANGHEL" as one word instead of six separate letters.

---

## 4. Words lighting up as you scroll (About text)

**What you see:** the About paragraph starts faded, and the words turn bright one by one as you scroll through it.

**Where:** `src/pages/main.jsx`

**How:**
1. framer-motion's `useScroll` reports how far the paragraph has moved through the screen, as a number from 0 to 1.
2. That number is turned into "how many words are lit".

```jsx
const textRef = useRef(null);
const words = STATEMENT.split(" ");
const [lit, setLit] = useState(0);

const { scrollYProgress } = useScroll({
  target: textRef,
  offset: ["start 85%", "end 50%"], // 0 = top of text at 85% of screen, 1 = bottom at 50%
});
useMotionValueEvent(scrollYProgress, "change", (p) =>
  setLit(Math.round(p * words.length)),
);

<p className="statement" ref={textRef}>
  {words.map((w, i) => (
    <span key={i} className={i < lit ? "lit" : ""}>{w} </span>
  ))}
</p>
```

```css
.statement span     { opacity: 0.14; transition: opacity 0.5s; }
.statement span.lit { opacity: 1; }
```

The CSS `transition` softens each word as it switches, so it fades in instead of popping.

---

## 5. Numbers counting up (About stats)

**Where:** `src/pages/main.jsx` (`CountUp`)

```jsx
function CountUp({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });  // true the first time it's seen
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {            // framer-motion tweens 0 → to
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return <b ref={ref}>{n}{suffix}</b>;
}

<CountUp to={project.length} />     // updates automatically when you add a project
<CountUp to={24} suffix="h" />
```

---

## 6. The page transition (navy curtain)

**What you see:** you click a project, a navy panel rises over the page, the case study loads behind it, and the panel slides off the top.

**Where:** `src/components/transition.js`, the curtain `<div>` in `src/App.jsx`, and the CSS in `src/index.css`

**The idea:** the curtain is always on the page, parked below the screen. Adding classes to `<body>` moves it through 3 states:

| Body class | Curtain position | Meaning |
|---|---|---|
| (none) | `translateY(100%)`: below the screen | idle |
| `pt-leave` | `translateY(0)`: covering the screen | old page is hidden |
| `pt-arrive` | `translateY(-100%)`: above the screen | new page is revealed |
| `pt-reset` | no transition | jump back below without anyone seeing |

```css
.curtain {
  position: fixed; inset: 0; z-index: 10000;
  background: var(--navy);
  transform: translateY(100%);
  pointer-events: none;
  transition: transform 0.7s var(--ease);
}
.pt-leave  .curtain { transform: none; }
.pt-arrive .curtain { transform: translateY(-100%); }
.pt-reset  .curtain { transition: none; }
```

```js
// src/components/transition.js
const COVER = 700; // same as the CSS transition time

export function goWithCurtain(navigate, to) {
  const body = document.body;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    navigate(to); window.scrollTo(0, 0); return;   // no animation for these users
  }
  body.classList.add("pt-leave");                  // 1. curtain rises and covers
  setTimeout(() => {
    navigate(to);                                  // 2. change page while hidden
    window.scrollTo(0, 0);
    body.classList.add("pt-arrive");               // 3. curtain slides off the top
    setTimeout(() => {
      body.classList.add("pt-reset");              // 4. snap back below, no animation
      body.classList.remove("pt-leave", "pt-arrive");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => body.classList.remove("pt-reset")),
      );
    }, COVER + 50);
  }, COVER);
}
```

**Using it on a link.** It stays a real link, so right-click → "open in new tab" still works:
```jsx
const navigate = useNavigate();

<Link
  to={`/detail/${pro.id}`}
  onClick={(e) => {
    e.preventDefault();                    // stop the instant page change
    goWithCurtain(navigate, `/detail/${pro.id}`);
  }}
>
```

**Why it's smooth:**
- The page swap happens while the screen is fully covered, so you never see the old page disappear or the new one pop in.
- Only `transform` is animated.
- The two `requestAnimationFrame` calls wait 2 frames so the browser applies "no transition" before the transition is turned back on.

**Going back:** `/#work` brings you back to the Work section. A small effect in `featured.jsx` scrolls to whatever section the `#hash` names:
```jsx
useEffect(() => {
  const id = location.hash === "#proj" ? "work" : location.hash.slice(1);
  if (id) document.getElementById(id)?.scrollIntoView();
}, [location.hash]);
```

---

## 7. Light and dark sections from one set of styles

**What you see:** white sections and navy rounded panels, with text, lines and chips that adapt to each automatically.

**Where:** `src/index.css`

**The trick:** components never use fixed colors. They read **CSS variables**, and each section redefines those variables with `data-theme`:

```css
[data-theme='light'] {
  --bgc: #fff;     --text: #0A122A;  --muted: #5B6684;
  --line: rgba(10,18,42,.1);         --accent: #2E4FC7;
  background: var(--bgc); color: var(--text);
}
[data-theme='dark'] {
  --bgc: var(--ink); --text: #EAF2FF; --muted: #8792B5;
  --line: rgba(208,230,253,.09);      --accent: var(--ice);
  background: var(--bgc); color: var(--text);
}
.panel { margin: 0 14px; border-radius: 44px; overflow: clip; } /* the rounded navy card */
```

```jsx
<section className="sec panel" id="work" data-theme="dark"> … </section>
<section className="sec" id="certs" data-theme="light"> … </section>
```

The same `.chip`, `.label` or `em` looks right on both, because `var(--line)`, `var(--accent)` and the others change with the section.

---

## 8. A top bar that changes color with the section under it

**Where:** `src/components/useBarTheme.js` (used by `nav.jsx` and `detail.jsx`)

```js
export default function useBarTheme() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 40);
      // which section is behind the bar (40px from the top)?
      const under = [...document.querySelectorAll("[data-theme]")].find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= 40 && r.bottom > 40;
      });
      setTheme(under?.dataset.theme ?? "light");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { /* remove listeners */ };
  }, []);

  return { scrolled, theme };
}
```

```jsx
const { scrolled, theme } = useBarTheme();
<header className={`topbar${scrolled ? " scrolled" : ""}`} data-on={theme}>
```

```css
.topbar[data-on='dark']  { --text: #EAF2FF; color: var(--text); }
.topbar.scrolled[data-on='light'] { background: rgba(255,255,255,.72); }
.topbar.scrolled                  { backdrop-filter: blur(14px); }   /* frosted glass */
```

---

## 9. The custom cursor

**What you see:**
- A small dot that is black over white and white over navy.
- It becomes a ring over links.
- It becomes a circle that says "View case →" over projects.

**Where:** `src/components/Cursor.jsx` and `src/index.css`

**Trick 1: color that adapts by itself.** The dot is white with `mix-blend-mode: difference`, which inverts whatever is underneath. White on a white background comes out black, and white on navy stays light.

```css
.cursor {
  position: fixed; left: 0; top: 0; z-index: 10001;
  width: 10px; height: 10px; margin: -5px 0 0 -5px;   /* centered on the pointer */
  border-radius: 99px; background: #fff;
  mix-blend-mode: difference;
  pointer-events: none;                               /* never blocks clicks */
  transition: width .45s var(--ease), height .45s var(--ease), margin .45s var(--ease);
}
.cursor.is-label { width: 120px; height: 120px; margin: -60px 0 0 -60px;
                   background: var(--ice); mix-blend-mode: normal; }
.cursor.is-link  { width: 44px; height: 44px; margin: -22px 0 0 -22px;
                   background: transparent; border: 1px solid #fff; }
```

**Trick 2: label anything with an HTML attribute.**
```jsx
<Link to="/detail/1" data-cursor="View case →">…</Link>
```
```js
const move = (e) => {
  ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; // transform = smooth
  const labelled = e.target.closest("[data-cursor]");
  const link = e.target.closest("a, button, [role='button']");
  if (labelled) { setLabel(labelled.dataset.cursor); setMode("is-label"); }
  else setMode(link ? "is-link" : "");
};
```

**Trick 3: only on mouse devices.** Phones keep their normal behavior:
```js
if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
document.documentElement.classList.add("has-cursor"); // hides the system cursor via CSS
```

---

## 10. A section that stays in place while a line draws (Process)

**Where:** `src/pages/process.jsx` and `src/css/process.css`

**The trick:** `position: sticky` inside a tall section.
- The section is 260vh tall, but its content is only 100vh and sticks to the top.
- While you scroll through the extra height, the content stays in place and the scroll progress drives the line.

```css
.process      { height: 260vh; }
.process-pin  { position: sticky; top: 0; height: 100vh; }
.process-rail i { transform-origin: left; }   /* grows from the left */
```

```jsx
const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 }); // springy smoothing

<div className="process-rail"><motion.i style={{ scaleX }} /></div>
```

`useSpring` adds a little give, so the line eases after your scroll instead of jumping with every scroll-wheel tick. On phones the section is a normal list: `height: auto` and `position: static`.

---

## 11. A gallery that slides sideways while you scroll down (case study)

**Where:** `src/pages/detail.jsx` and `src/css/detail.css`

This is the same sticky trick as Process, but scroll progress moves the row of screens left:

```jsx
const [distance, setDistance] = useState(0);
// how far the row must travel = its full width minus the screen width
useLayoutEffect(() => {
  const measure = () =>
    setDistance(Math.max(0, trackRef.current.scrollWidth - window.innerWidth + 80));
  measure();
  window.addEventListener("resize", measure);
  return () => window.removeEventListener("resize", measure);
}, [id]);

const { scrollYProgress } = useScroll({ target: galRef, offset: ["start start", "end end"] });
const slide = useTransform(scrollYProgress, [0, 1], [0, -distance]); // 0 → -distance px

<motion.div className="pd-track" ref={trackRef} style={{ x: slide }}> … </motion.div>
```

```css
.pd-gal     { height: 320vh; }
.pd-gal-pin { position: sticky; top: 0; height: 100vh; overflow: hidden; }
.pd-track   { display: flex; gap: 40px; }
```

---

## 12. A screenshot that tilts flat as it scrolls in (case study showcase)

**Where:** `src/pages/detail.jsx` and `src/css/detail.css`

```jsx
const { scrollYProgress } = useScroll({ target: showRef, offset: ["start end", "start 10%"] });
const tilt  = useTransform(scrollYProgress, [0, 1], [24, 0]);    // 24° → flat
const grow  = useTransform(scrollYProgress, [0, 1], [0.9, 1]);   // 90% → full size
const drift = useTransform(scrollYProgress, [0, 1], [160, 0]);   // side screens rise

<motion.div className="pd-main-shot" style={{ rotateX: tilt, scale: grow }}> … </motion.div>
<motion.div className="pd-float f1"  style={{ y: drift, rotate: -3 }}> … </motion.div>
```

```css
.pd-show      { perspective: 1600px; }      /* gives the tilt real 3D depth */
.pd-main-shot { transform-origin: 50% 100%; }/* hinges on its bottom edge */
```

`useTransform` maps one range of numbers onto another. Scroll progress becomes an angle, a scale or a pixel offset.

---

## 13. A preview that follows the cursor (Certificates)

**Where:** `src/pages/certificates.jsx`

**The trick:** don't move the preview exactly to the mouse. On every frame, move it **14% of the remaining distance**. That gives it a soft, trailing motion, and the leftover distance also sets a small tilt.

```js
useEffect(() => {
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const move = (e) => { tx = e.clientX; ty = e.clientY; };   // target = mouse
  const tick = () => {
    x += (tx - x) * 0.14;                                   // ease toward it
    y += (ty - y) * 0.14;
    const tilt = Math.max(-6, Math.min(6, (tx - x) * 0.08));
    previewRef.current.style.transform =
      `translate(${x + 28}px, ${y - 120}px) rotate(${tilt}deg)`;
    raf = requestAnimationFrame(tick);                      // every frame
  };
  window.addEventListener("mousemove", move);
  raf = requestAnimationFrame(tick);
  return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
}, []);
```

To show and hide it, a class switches `opacity` and `scale`:
```css
.cert-preview    { opacity: 0; scale: .6; transition: opacity .35s var(--ease), scale .5s var(--ease); }
.cert-preview.on { opacity: 1; scale: 1; }
```

The style is written to the element directly through a `ref`, not through React state. That way React doesn't re-render 60 times a second.

**Row hover:** a background fills in from the bottom using `scaleY`:
```css
.cert::before       { content: ''; position: absolute; inset: 0; z-index: -1;
                      background: var(--surface); transform: scaleY(0);
                      transform-origin: bottom; transition: transform .5s var(--ease); }
.cert:hover::before { transform: none; }
```

---

## 14. Contact form details

**Where:** `src/pages/contact.jsx` and `src/css/contact.css`

### Floating labels, with pure CSS
The label sits inside the empty field and moves up once you type. The trick is `placeholder=" "` (a single space) combined with `:placeholder-shown`:

```jsx
<label className="field">
  <input name="name" required placeholder=" " … />
  <span>Your name</span>
</label>
```
```css
.field span { position: absolute; top: 26px; transition: all .35s var(--ease); }
.field input:focus + span,
.field input:not(:placeholder-shown) + span {     /* focused OR has text */
  top: 0; font-size: 11px; text-transform: uppercase; letter-spacing: .14em;
}
```

### The orange focus line
```css
.field::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 2px;
                background: var(--signal); transform: scaleX(0); transform-origin: left;
                transition: transform .5s var(--ease); }
.field:focus-within::after { transform: none; }   /* grows left → right */
```

### The "Message sent" wipe
The navy panel is always there, but cut down to a circle of size 0 with `clip-path`. On success the circle grows to cover the whole form.

```css
.sent { position: absolute; inset: 0; background: var(--navy);
        clip-path: circle(0% at 50% 92%);            /* a dot near the button */
        transition: clip-path 1s var(--ease); }
.contact-form.done .sent { clip-path: circle(150% at 50% 92%); }
```

### Choice buttons
These are toggle buttons kept in an array, which is joined into text when the form is sent:
```jsx
const toggleService = (s) =>
  setServices((list) => (list.includes(s) ? list.filter((x) => x !== s) : [...list, s]));

body: JSON.stringify({ ...formData, service: services.join(", ") })
```

---

## 15. Quote switcher (Kind words)

**Where:** `src/pages/testimonials.jsx`

`AnimatePresence mode="wait"` lets the old quote finish fading out before the new one fades in. Changing the `key` is what tells framer-motion it's a new quote.

```jsx
<AnimatePresence mode="wait">
  <motion.figure
    key={i}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.8, ease: EASE }}
  > … </motion.figure>
</AnimatePresence>
```

The progress bar under it is a CSS animation that runs for the same 5 s as the timer:
```css
.tm-dots button.on::after { animation: tm-bar 5s linear forwards; }
@keyframes tm-bar { from { transform: translateX(-100%); } to { transform: none; } }
```

---

## 16. Film grain

**Where:** `src/index.css` (`.grain`) and the `<div className="grain" />` in `App.jsx`

This is an SVG noise texture laid over the whole page at 5% opacity. It jumps a few pixels 4 times a second so it looks like film:

```css
.grain {
  position: fixed; inset: -50%; z-index: 90; pointer-events: none; opacity: .05;
  background-image: url("data:image/svg+xml,…feTurbulence…");  /* noise, no image file */
  animation: grain 1s steps(4) infinite;                        /* steps = jumpy, like film */
}
```

---

## 17. Photo pixel swap (your original component)

**Where:** `src/components/pixel.jsx` (unchanged) and its new look in `src/css/about.css`

The component builds a grid of squares over the photo. GSAP shows the squares in **random order**, swaps the photo while it's fully covered, then hides the squares in random order again. The redesign only passes new options:

```jsx
<PixelTransition
  firstContent={<img src={d1} … />}
  secondContent={<img src={peice} … />}
  gridSize={8}            // 8 × 8 squares
  pixelColor="#0A122A"    // navy squares
  aspectRatio="125%"      // 4:5 portrait
/>
```

This is the same trick as the page curtain: **cover → swap → uncover**, so you never see the swap happen.

---

## 18. Phones and accessibility

- **Every section has its own `@media (max-width: 760px)` block** at the bottom of its CSS file. Sticky and sideways effects switch off on phones and become normal lists.
- **Hover-only effects** (the cursor and the certificate preview) only run where `(hover: hover) and (pointer: fine)` is true. On phones, the certificate image is shown in the row instead.
- **Reduced motion:** if the visitor's device asks for less motion, every animation finishes instantly:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
  }
  ```
- **Form inputs use 16px text on phones**, which stops iPhones from zooming in when you tap a field.
- Interactive things are real `<a>` and `<button>` elements, so they work with the keyboard. Esc closes the full-size views.

---

## Quick recipe: add a new animated section

```jsx
import Reveal from "../components/Reveal";

function Awards() {
  return (
    <section className="sec panel" id="awards" data-theme="dark">  {/* or "light", no panel */}
      <div className="wrap">
        <Reveal className="label"><span className="mono">(08) — Awards</span></Reveal>
        <Reveal as="h2" className="big-h">Some <em>wins.</em></Reveal>
        {/* your content: use var(--text), var(--muted), var(--line), var(--accent) */}
      </div>
    </section>
  );
}
```

Then add `<Awards />` in `src/App.jsx` where you want it. The top bar, theme colors and fade-ins all work automatically.
