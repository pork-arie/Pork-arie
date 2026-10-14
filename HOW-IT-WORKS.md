# How the animations and UI components work

This guide explains the techniques behind the redesign, with the real code
from this repo. Each part says **what you see**, **how it works**, and
**where the code lives**.

The libraries involved are ones the project already had:
- **framer-motion**: scroll-linked and enter animations
- **gsap**: only inside the original PixelTransition
- **plain CSS**: everything else


## Contents

**Part 1: motion**
0. Why it feels smooth: 4 rules
1. The one easing curve
2. Fade up on scroll (`<Reveal>`)
3. Letters sliding up out of a mask
4. Words lighting up as you scroll
5. Numbers counting up
6. The page transition (navy curtain)
7. Light and dark sections
8. A top bar that changes color
9. **The custom cursor: full guide** (how to make one, and how this one works)
10. Process: stays in place while a line draws
11. Gallery that slides sideways
12. **Stacked screenshots that start small and grow on scroll**
13. Certificate preview that follows the cursor
14. Contact form details
15. Quote switcher
16. Film grain
17. Photo pixel swap

**Part 2: components and layout**

18. **The `Browser` frame**
19. Full-size view (lightbox)
20. Each project gets its own color
21. Work cards: bento grid, hover zoom, number pill
22. Toolkit grid with hairline dividers
23. Front page details
24. Top bar active link
25. Labels, headings, buttons (shared classes)
26. Copy-email button
27. "Next case study" panel
28. Phones and accessibility

Plus a quick recipe for adding your own section at the end.

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

### Going back (case study → home)

It's the same curtain in the other direction. On the case-study page, a small helper `go(to)` wraps `goWithCurtain`, and the links use it:

```jsx
// src/pages/detail.jsx
const nav = useNavigate();
const go = (to) => (e) => {
  e.preventDefault();
  goWithCurtain(nav, to);
};

<a className="pd-back" href="/#work" onClick={go("/#work")}>← All projects</a>  {/* back to Work */}
<a className="brand" href="/" onClick={go("/")}>ANGHEL</a>                       {/* back to top */}
<a href={`/detail/${next.id}`} onClick={go(`/detail/${next.id}`)}>…</a>         {/* next project */}
<a href="/#contact" onClick={go("/#contact")}>Start a project →</a>             {/* to the form */}
```

Then the home page has to scroll to the section named after the `#`. React Router doesn't do this by itself, so a small effect in `featured.jsx` does it:
```jsx
useEffect(() => {
  const id = location.hash === "#proj" ? "work" : location.hash.slice(1); // "#work" → "work"
  if (id) document.getElementById(id)?.scrollIntoView();
}, [location.hash]);
```

The order matters. `goWithCurtain` runs `window.scrollTo(0, 0)` right after `navigate()`, and then the effect above runs and jumps to `#work`. Both happen while the curtain is still covering the screen, so you never see the jump.

> The browser's own back button (or a phone's back swipe) skips the curtain. That's normal: it's a browser action, not one of your links, so it changes the page instantly.

### Setting it up yourself: the 3 pieces

1. **The curtain element:** rendered once, for the whole app, in `src/App.jsx`:
   ```jsx
   <div className="curtain" aria-hidden="true" />
   ```
2. **The CSS:** the 4 states in `src/index.css` (`.curtain`, `.pt-leave`, `.pt-arrive`, `.pt-reset`), shown above.
3. **The function:** `goWithCurtain(navigate, to)` from `src/components/transition.js`. Call it in any link's `onClick` after `e.preventDefault()`.

To use it on a new link anywhere:
```jsx
import { useNavigate } from "react-router-dom";
import { goWithCurtain } from "../components/transition";

const navigate = useNavigate();
<a href="/somewhere" onClick={(e) => { e.preventDefault(); goWithCurtain(navigate, "/somewhere"); }}>Go</a>
```

**Timeline of one click (about 1.5 s total):**

| Time | What happens |
|---|---|
| 0 ms | `pt-leave` added → curtain slides up from the bottom and covers the screen (0.7 s) |
| 700 ms | page changes behind it, scroll resets (or jumps to `#work`), `pt-arrive` added → curtain slides off the top (0.7 s) |
| 1450 ms | `pt-reset` → curtain snaps back below the screen with no animation, ready for the next click |

**Want it faster or slower?** Change `COVER` in `transition.js` **and** the `0.7s` in `.curtain`'s `transition` in `index.css`. Keep them the same.

**Different color?** Change `background: var(--navy)` on `.curtain`. You could even give it your orange.

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

## 9. The custom cursor: full guide

**What you see** (mouse and trackpad only):
- A small **dot** follows your pointer. It's **black over white** sections and **white over navy** ones, without any code checking the colors.
- Over a **link or button** it grows into a **ring**.
- Over a **project card** it grows into a big **light-blue circle that says "VIEW CASE →"** ("NEXT CASE →" on the case-study page).
- On **phones and tablets** it doesn't exist, so the normal touch behavior stays.

**Where:**
- `src/components/Cursor.jsx`: the component (JavaScript)
- `src/index.css`: the "custom cursor" block (looks)
- `src/App.jsx`: where it's placed once with `<Cursor />`

### 9.1 How it works: the idea in 5 steps

1. **Hide the real cursor** with CSS `cursor: none`.
2. **Draw your own** cursor: an ordinary `<div>` that is `position: fixed` (stays in place on screen while the page scrolls) and sits above everything.
3. **Move it** to the mouse position every time the mouse moves (`mousemove` gives `clientX` / `clientY`).
4. **Check what's under the mouse** on every move. If it's a link, add a class that turns the dot into a ring. If the element has `data-cursor="text"`, add a class that turns it into a labelled circle.
5. **Let CSS animate** the size changes with a `transition`, so the dot smoothly grows and shrinks instead of jumping.

That's all a custom cursor is: a hidden real cursor plus a `div` that follows the mouse and changes its class.

### 9.2 The full component

```jsx
// src/components/Cursor.jsx
import { useEffect, useRef, useState } from "react";

function Cursor() {
  const ref = useRef(null);               // the cursor <div>, to move it directly
  const [label, setLabel] = useState(""); // text shown in the big circle
  const [mode, setMode] = useState("");   // "" (dot) | "is-link" (ring) | "is-label" (circle)

  useEffect(() => {
    // A. Only for real mice: phones/tablets stop here and never get a custom cursor
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    // B. Tell the CSS to hide the system cursor
    document.documentElement.classList.add("has-cursor");

    // C. Every mouse move: reposition + decide the shape
    const move = (e) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      const labelled = e.target.closest?.("[data-cursor]");
      const link = e.target.closest?.("a, button, [role='button']");
      if (labelled) {
        setLabel(labelled.dataset.cursor); // the text from data-cursor="…"
        setMode("is-label");
      } else {
        setMode(link ? "is-link" : "");
      }
    };

    // D. While scrolling, the page moves under a still mouse, so what's under
    //    the cursor changes; go back to the plain dot until the mouse moves again
    const scroll = () => setMode("");

    window.addEventListener("mousemove", move);
    window.addEventListener("scroll", scroll, { passive: true });

    // E. Clean up when the component unmounts
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("scroll", scroll);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []); // [] = set up once

  return (
    <div className={`cursor ${mode}`} ref={ref} aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}

export default Cursor;
```

Placed **once** for the whole site, after everything else, in `src/App.jsx`:
```jsx
import Cursor from './components/Cursor'
…
<Mascot … />
<div className="grain" aria-hidden="true" />
<div className="curtain" aria-hidden="true" />
<Cursor />
```

### 9.3 Line by line: why each part is there

| Code | Why |
|---|---|
| `useRef` for the position, `useState` for the shape | The mouse moves dozens of times a second. Writing the position straight to `ref.current.style` skips React re-rendering. The shape (`mode`) rarely changes, so state is fine there |
| `transform: translate(x, y)` instead of `left` / `top` | `transform` moves the element on the GPU without recalculating the layout, so it stays smooth. `left` / `top` would stutter |
| `matchMedia("(hover: hover) and (pointer: fine)")` | True only for a precise pointer that can hover: a mouse or trackpad. Phones report `hover: none`, so they skip everything |
| `classList.add("has-cursor")` on `<html>` | The system cursor is hidden only when the custom one is actually running. If JavaScript fails, people still see a normal cursor |
| `e.target.closest("[data-cursor]")` | `closest` walks up from the element under the mouse to its parents. Hovering the image *inside* a card still finds the card's `data-cursor` |
| `"a, button, [role='button']"` | Everything clickable turns the dot into a ring |
| the `?.` in `closest?.(…)` | Sometimes `e.target` is the page itself, which has no `closest`. `?.` skips it instead of crashing |
| scroll → `setMode("")` | Without this, the "VIEW CASE" circle could stay on after you scroll away from a card |
| `aria-hidden="true"` | Screen readers ignore it, since it's decoration |
| the cleanup `return () => …` | Removes the listeners and shows the normal cursor again if the component is removed |

### 9.4 The CSS, explained

```css
/* src/index.css */

.cursor { display: none; }                  /* default: no custom cursor (phones) */

@media (hover: hover) and (pointer: fine) { /* only mouse/trackpad screens */

  /* 1. hide the real cursor, but only once Cursor.jsx has added .has-cursor */
  html.has-cursor,
  html.has-cursor a,
  html.has-cursor button { cursor: none; }

  /* 2. the dot */
  .cursor {
    position: fixed; left: 0; top: 0;       /* starts at the top-left corner; transform moves it */
    z-index: 10001;                         /* above everything, even the page curtain */
    pointer-events: none;                   /* clicks pass straight through it */

    width: 10px; height: 10px;
    margin: -5px 0 0 -5px;                  /* half the size, negative = centered on the pointer */
    border-radius: 99px;                    /* a circle */
    background: #fff;
    mix-blend-mode: difference;             /* ⭐ the color trick, see 9.5 */

    display: grid; place-items: center;     /* centers the label text */
    font: 500 12px var(--label); letter-spacing: .06em; text-transform: uppercase;
    color: var(--navy); white-space: nowrap; overflow: hidden;

    /* 3. animate shape changes smoothly with the site's easing curve */
    transition: width .45s var(--ease), height .45s var(--ease),
                margin .45s var(--ease), background .3s;
  }

  /* the label text is invisible on the small dot */
  .cursor span { opacity: 0; transition: opacity .2s; }

  /* 4. over [data-cursor]: big light-blue circle with text */
  .cursor.is-label {
    width: 120px; height: 120px; margin: -60px 0 0 -60px; /* still centered: half of 120 */
    background: var(--ice);
    mix-blend-mode: normal;                 /* turn the inverting off so the blue stays blue */
  }
  .cursor.is-label span { opacity: 1; transition-delay: .15s; } /* text fades in after it grows */

  /* 5. over links: an outlined ring */
  .cursor.is-link {
    width: 44px; height: 44px; margin: -22px 0 0 -22px;
    background: transparent; border: 1px solid #fff;
  }
}
```

**Why the `margin` changes with the size:** `translate(x, y)` puts the cursor's **top-left corner** on the mouse. A negative margin of half the width and height moves its **center** onto the mouse. When the dot grows from 10px to 120px, the margin grows from -5px to -60px, so it grows outward from the pointer instead of to the bottom-right.

### 9.5 The color trick: `mix-blend-mode: difference`

`difference` subtracts the colors under the element from its own color:

| Cursor color | Background | Result you see |
|---|---|---|
| white `#fff` | white section `#fff` | **black** (white − white = black) |
| white `#fff` | navy panel `#060A18` | **almost white** (white − dark = light) |
| white `#fff` | a photo | the photo's colors inverted, which is a fun effect |

So one white dot is always visible on both your white and navy sections, without any JavaScript checking colors. On the big label circle it's turned off (`mix-blend-mode: normal`), because the light-blue fill and navy text need to show as they are.

### 9.6 Labelling anything with `data-cursor`

Add the attribute to any element and the cursor shows that text over it. No other code is needed:

```jsx
// src/pages/featured.jsx: Work cards
<Link to={`/detail/${pro.id}`} data-cursor="View case →">…</Link>

// src/pages/detail.jsx: the next project panel
<a className="panel pd-next" href={`/detail/${next.id}`} data-cursor="Next case →">…</a>

// your own ideas
<img src={photo} data-cursor="Hi! 👋" />
<a href={cvPdf} data-cursor="Download ↓">My CV</a>
```

Keep labels short, about 2–3 words. The circle is 120px wide and `white-space: nowrap` keeps the text on one line.

### 9.7 Making your own custom cursor from scratch

Here's the minimum version for any other project, plain React plus CSS:

```jsx
// MyCursor.jsx
import { useEffect, useRef } from "react";

export default function MyCursor() {
  const ref = useRef(null);
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    const move = (e) =>
      (ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`);
    addEventListener("mousemove", move);
    return () => removeEventListener("mousemove", move);
  }, []);
  return <div className="my-cursor" ref={ref} />;
}
```
```css
@media (pointer: fine) {
  body { cursor: none; }
  .my-cursor {
    position: fixed; left: 0; top: 0; z-index: 9999; pointer-events: none;
    width: 16px; height: 16px; margin: -8px 0 0 -8px;
    border-radius: 50%; background: #fff; mix-blend-mode: difference;
  }
}
```

Then add hover shapes the same way as in 9.2 and 9.4: check `e.target.closest(...)`, set a class, and style that class.

### 9.8 Customizing yours

| I want… | Change |
|---|---|
| a bigger dot | `.cursor` width/height to e.g. `14px`, margin to `-7px 0 0 -7px` |
| an orange dot | `background: var(--signal)` and remove `mix-blend-mode` (it would invert the orange into blue) |
| a different ring size over links | `.cursor.is-link` width/height + the matching negative margin |
| a different circle color | `.cursor.is-label { background: … }` |
| faster or slower growing | the `.45s` values in `transition` |
| the system cursor back | delete `<Cursor />` from `App.jsx` |

**Extra: a trailing ("lazy") cursor.** If you'd like the dot to lag softly behind the mouse, ease it toward the mouse on every frame. This is the same technique the certificate preview uses (section 13):

```js
let tx = 0, ty = 0, x = 0, y = 0;
addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
(function tick() {
  x += (tx - x) * 0.2;  // 0.2 = how quickly it catches up (1 = no lag)
  y += (ty - y) * 0.2;
  ref.current.style.transform = `translate(${x}px, ${y}px)`;
  requestAnimationFrame(tick);
})();
```

### 9.9 Mistakes to avoid

- **Forgetting `pointer-events: none`.** The cursor div sits right under your mouse, so it would "catch" every click and nothing on the page would be clickable.
- **Moving it with `left` / `top`.** That works, but it stutters. Use `transform`.
- **Hiding the system cursor on phones.** Phones have no cursor, and hiding it can break tap highlights. Always wrap it in the `(hover: hover) and (pointer: fine)` media query.
- **Text inputs.** With `cursor: none` everywhere, the I-beam over text fields disappears too. That's why this site only hides it on `html`, `a` and `button`, so inputs keep their normal text cursor.
- **A z-index that's too low.** It must be above everything (`10001` here), or it disappears behind modals and the curtain.

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

## 12. Stacked screenshots that start small and grow on scroll (case study showcase)

**What you see:** on a case-study page, the dark showcase holds 3 screenshots stacked on top of each other:
- **one big screen** in the middle that starts **tilted back and smaller (90%)**, then stands up flat and grows to **full size** as you scroll into it
- **two smaller screens** floating over its corners, slightly rotated, that **rise into place** at different speeds

**Where:** `src/pages/detail.jsx` (showcase section) and `src/css/detail.css` (`.pd-show`, `.pd-main-shot`, `.pd-float`)

### Step 1: stack them
The big screen sits in normal layout. The two small ones use `position: absolute`, so they float **on top of** it, half hanging over its edges. Because they come later in the HTML, they're drawn above the big screen without needing a `z-index`.

```jsx
<section className="panel pd-show" data-theme="dark" ref={showRef}>
  <div className="wrap">                       {/* position: relative = the anchor */}
    <motion.div className="pd-main-shot" …>    {/* big screen, normal layout */}
      <Browser src={screens[0]} … />
    </motion.div>
    <motion.div className="pd-float f1" …>     {/* small screen, bottom-left */}
      <Browser src={screens[1]} … />
    </motion.div>
    <motion.div className="pd-float f2" …>     {/* small screen, top-right */}
      <Browser src={screens[2]} … />
    </motion.div>
  </div>
</section>
```

```css
.pd-show .wrap { position: relative; }          /* the floats are placed relative to this */
.pd-float      { position: absolute; width: 30%; }
.pd-float.f1   { left: -2%;  bottom: -70px; }   /* hangs off the bottom-left corner */
.pd-float.f2   { right: -2%; top: -50px; }      /* hangs off the top-right corner */
```

### Step 2: tie the animation to scroll
`useScroll` gives a number from **0** (the section's top is just entering the bottom of the screen) to **1** (its top has reached 10% from the top of the screen). `useTransform` turns that one number into several effects:

```jsx
const showRef = useRef(null);
const { scrollYProgress: showP } = useScroll({ target: showRef, offset: ["start end", "start 10%"] });

const tilt   = useTransform(showP, [0, 1], [24, 0]);    // leaning back 24° → flat
const grow   = useTransform(showP, [0, 1], [0.9, 1]);   // 90% size → 100%
const driftA = useTransform(showP, [0, 1], [160, 0]);   // left float: 160px lower → in place
const driftB = useTransform(showP, [0, 1], [220, 0]);   // right float: 220px lower → in place

<motion.div className="pd-main-shot" style={{ rotateX: tilt, scale: grow }}> … </motion.div>
<motion.div className="pd-float f1" style={{ y: driftA, rotate: -3 }}> … </motion.div>
<motion.div className="pd-float f2" style={{ y: driftB, rotate: 3 }}> … </motion.div>
```

### Step 3: make the tilt look 3D
```css
.pd-show      { perspective: 1600px; }        /* how far away the "camera" is: smaller = stronger 3D */
.pd-main-shot { transform-origin: 50% 100%; } /* hinges on its bottom edge, like a laptop lid */
```

### Why it feels deep
- **Different speeds = depth (parallax).** The two floats travel different distances (160px and 220px) over the same scroll, so they seem closer to you than the big screen. Things nearer to your eye move faster.
- **Small rotations (`-3°` and `3°`)** make the stack look casually placed instead of lined up on a grid.
- **Scroll-linked, not timed:** if you scroll slowly, it moves slowly. Scroll back up and it reverses. You control it.
- **Phones:** the floats are hidden (`.pd-float { display: none }`) and the tilt is turned off (`style={small ? undefined : …}`), so a small screen just shows one clean screenshot.

### Reuse it somewhere else
1. Put a `ref` on the section.
2. Call `useScroll({ target: ref, offset: [...] })`.
3. Map the progress with `useTransform` into whatever you want: `rotateX`, `scale`, `y`, `opacity`.
4. Pass the results through `style` on a `motion.div`.

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

## 18. The `Browser` frame: why every screenshot has a window bar

**What you see:** every project screenshot on the case-study page sits inside a fake browser window: a light gray bar with red, yellow and green dots, and sometimes a little address pill with the project name.

**Why it's there:**
- **Context.** A screenshot on its own floats in space. Inside a window frame, people read it right away as "this is a real website or app".
- **Consistency.** Your screenshots have different sizes and edges: some have a dark sidebar, some are white. The frame gives them all the same rounded edge, shadow and top bar, so they look like one set.
- **Premium feel.** Design studios use this "device frame" look to show their work.
- **It's also a button.** Clicking the frame opens the full-size screenshot.

**Where:** the `Browser` component at the top of `src/pages/detail.jsx`, plus the `.browser` styles in `src/css/detail.css`

```jsx
// A screenshot inside a simple browser window frame
function Browser({ src, alt, label, className = "", onOpen }) {
  return (
    <button type="button" className={`browser ${className}`} onClick={onOpen}
            aria-label={`View ${alt} full size`}>
      <span className="browser-bar" aria-hidden="true">
        <i /><i /><i />                 {/* the 3 dots */}
        {label && <span>{label}</span>} {/* optional address pill */}
      </span>
      <img src={src} alt={alt} loading="lazy" />
    </button>
  );
}

// using it
<Browser src={pro.img} alt="GymTrack Check-in desk" label="GymTrack · Check-in desk"
         onOpen={() => setView(pro.img)} />
```

```css
.browser {
  display: block; width: 100%; padding: 0; border: 0;
  border-radius: 16px; overflow: hidden;        /* rounds the image corners too */
  background: #fff; cursor: zoom-in;            /* a magnifier cursor hints "click to enlarge" */
  box-shadow: 0 60px 120px -30px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.08);
}
.browser-bar { position: relative; height: 38px; display: flex; align-items: center;
               gap: 7px; padding: 0 16px; background: #EEF1F7; }
.browser-bar i { width: 11px; height: 11px; border-radius: 9px; }
.browser-bar i:nth-child(1) { background: #FF5F57; }   /* red */
.browser-bar i:nth-child(2) { background: #FEBC2E; }   /* yellow */
.browser-bar i:nth-child(3) { background: #28C840; }   /* green */
.browser-bar span { position: absolute; left: 50%; transform: translateX(-50%);   /* centered pill */
                    padding: 5px 60px; border-radius: 8px; background: #fff;
                    font: 500 12px var(--sans); color: #6b7590; }
```

**Details worth knowing:**
- It's a `<button>`, not a `<div>`, so it works with the keyboard (Tab + Enter) and screen readers announce it as clickable.
- The dots are drawn with CSS, with no images: three empty `<i>` tags colored with `:nth-child`.
- `aria-hidden="true"` on the bar keeps screen readers from reading out the decoration.
- On phones the bar shrinks (26px tall, 8px dots) so it doesn't take up too much of a small screenshot.
- The "Next case study" panel uses only the bar part (`.browser-bar`) over its peek image, so it matches.

---

## 19. Full-size view (lightbox) for screenshots and certificates

**Where:** `src/pages/detail.jsx` (`view` state) and `src/pages/certificates.jsx` (`open` state)

```jsx
const [view, setView] = useState(null);           // null = closed, otherwise the image to show

// Esc closes it, listening only while it's open
useEffect(() => {
  if (!view) return;
  const onKey = (e) => e.key === "Escape" && setView(null);
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [view]);

{view && (
  <div className="pd-lightbox" onClick={() => setView(null)}>          {/* click the dark area = close */}
    <img src={view} alt="" onClick={(e) => e.stopPropagation()} />    {/* clicking the image doesn't close */}
    <button type="button" className="pd-close mono" onClick={() => setView(null)}>Close ✕</button>
  </div>
)}
```

```css
.pd-lightbox { position: fixed; inset: 0; z-index: 9000; display: grid; place-items: center;
               background: rgba(6,10,24,.85); backdrop-filter: blur(10px); }  /* frosted, dark */
```

The certificate version also animates in: the backdrop fades in and the image rises from 92% size.
```css
.cert-lightbox     { animation: cert-fade .4s var(--ease); }
.cert-lightbox img { animation: cert-rise .6s var(--ease); }
@keyframes cert-fade { from { opacity: 0; } }
@keyframes cert-rise { from { transform: scale(.92) translateY(20px); } }
```

Writing only the `from` step means "start here and animate to the element's normal style".

---

## 20. Each project gets its own color

**What you see:** GymTrack's case study is blue, Appoint's is purple, Faculty Evaluation's is green. That covers the label pill, the numbers in "What I built", the gallery progress bar and the glow behind the showcase.

**Where:** `theme` in `src/data/data.jsx`, applied in `src/pages/detail.jsx`

The trick is to set CSS variables in an **inline `style`** on the page wrapper. Everything inside reads them:

```js
// data.jsx
theme: { color: "#2E4FC7", soft: "#E6ECFF", glow: "rgba(120,150,255,.28)" },
```
```jsx
// detail.jsx
const accent = {
  "--proj":      pro.theme?.color ?? "#2E4FC7",   // ?? = fallback if theme is missing
  "--proj-soft": pro.theme?.soft  ?? "#E6ECFF",
  "--proj-glow": pro.theme?.glow  ?? "rgba(120,150,255,.28)",
};
<main className="pd" style={accent}> … </main>
```
```css
.pd-pill          { background: var(--proj-soft); color: var(--proj); }
.pd-built li span { color: var(--proj); }
.pd-progress i    { background: var(--proj); }
.pd-show { background: radial-gradient(70% 60% at 50% 0%, var(--proj-glow), transparent 70%), var(--ink); }
```

This way there's one stylesheet and one template, and the colors still differ per project. A new project only needs a `theme` line.

---

## 21. Work cards: bento grid, hover zoom and number pill

**Where:** `src/pages/featured.jsx` and `src/css/work.css`

**Wide first card, then two per row:** the grid has 2 columns, and the first card stretches across both.
```jsx
<Reveal className={`case${i === 0 ? " wide" : ""}`}> … </Reveal>
```
```css
.bento     { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.case.wide { grid-column: 1 / -1; }              /* from the first line to the last = full width */
.case.wide .case-shot { aspect-ratio: 16 / 6.6; }/* wider, shorter banner */
```

**Hover zoom inside the frame:** the image grows, but the frame has `overflow: hidden`, so it zooms within its box instead of growing bigger.
```css
.case-shot              { overflow: hidden; border-radius: 14px; aspect-ratio: 16 / 8.4; }
.case-shot img          { object-fit: cover; object-position: top; transition: transform 1.2s var(--ease); }
.case:hover .case-shot img { transform: scale(1.045); }
.case-shot::after       { content: ''; position: absolute; inset: 0;        /* soft dark fade at the bottom */
                          background: linear-gradient(180deg, transparent 55%, rgba(6,10,24,.55)); }
```
`object-fit: cover` + `object-position: top` fill the box without stretching and always show the top of the website, where the important part usually is.

**"01 / 03" pill:** a frosted-glass badge in the corner.
```css
.case-num { position: absolute; top: 28px; right: 28px; z-index: 2;
            background: rgba(6,10,24,.7); backdrop-filter: blur(8px);
            padding: 7px 12px; border-radius: 99px; }
```

**Staggered arrival:** the two half-width cards come in one after the other, because the second gets a 0.12 s delay:
```jsx
delay={i === 0 ? 0 : ((i + 1) % 2) * 0.12}
```

---

## 22. Toolkit grid with hairline dividers

**Where:** `src/pages/stack.jsx` and `src/css/toolkit.css`

**The 1px gap trick:** to draw thin lines between the 3 columns without adding borders to each one, the **grid's background** is set to the line color with a `1px` gap, and each column gets the page background. The 1px of background that shows through the gaps becomes the dividers.

```css
.stack-grid { display: grid; grid-template-columns: repeat(3, 1fr);
              gap: 1px; background: var(--line);          /* lines = grid background through the gap */
              border: 1px solid var(--line); border-radius: 22px; overflow: hidden; }
.stack-col  { background: var(--bgc); padding: 34px; }    /* each column covers the rest */
```

The content comes from a list in `data.jsx`, so adding a tool is a one-word edit:
```js
export const toolkit = [
  { group: "Frontend", title: "Interfaces", tools: ["React", "Vite", "Tailwind CSS", …] },
  …
]
```

---

## 23. Front page details

**Where:** `src/pages/front.jsx` and `src/css/hero.css`

**Your grid is unchanged.** `CursorGrid` covers the whole section behind the text:
```css
.front .cursor-grid { position: absolute; inset: 0; z-index: 0; }
.front-inner        { position: relative; z-index: 1; pointer-events: none; }  /* text above the grid */
.front-inner a      { pointer-events: auto; }                                 /* but buttons stay clickable */
```
`pointer-events: none` on the text layer lets the mouse "fall through" the big ANGHEL letters, so the grid still lights up under them.

**Soft blue glow at the bottom:**
```css
.front-aura { position: absolute; inset: auto -10% -40% -10%; height: 70%; pointer-events: none;
              background: radial-gradient(60% 60% at 50% 100%, rgba(208,230,253,.55), transparent 70%); }
```

**Live Manila clock:** a small custom hook that re-reads the time every second:
```jsx
function useManilaClock() {
  const read = () => new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Manila" });
  const [time, setTime] = useState(read);
  useEffect(() => {
    const id = setInterval(() => setTime(read()), 1000);
    return () => clearInterval(id);                       // stop when the page unmounts
  }, []);
  return time;
}
```

**Room for the mascot:** the buttons keep 150px clear on the right so the mascot in the corner doesn't cover them (desktop only):
```css
.front-cta { padding-right: 150px; }
@media (max-width: 760px) { .front-cta { padding-right: 0; } }
```

**Same timing for everything:** a small helper builds the fade props with a delay, so the info row, tagline and buttons arrive in order after the letters:
```jsx
const fade = (delay) => ({
  initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 },
  transition: { duration: 1, ease: EASE, delay },
});
<motion.div className="front-meta" {...fade(0.2)}>…</motion.div>
<motion.p className="front-tagline" {...fade(0.75)}>…</motion.p>
```

---

## 24. Top bar: highlighting the section you're in

**Where:** `src/parts/nav.jsx`

The active link is the **last section whose top has passed the middle of the screen**:
```jsx
LINKS.forEach(([, id]) => {
  const el = document.getElementById(id);
  if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) on = id;
});
setActive(on);

<a href={`#${id}`} className={active === id ? "on" : ""}>{name}</a>
```
```css
.topbar ul a    { color: var(--muted); transition: color .3s; }
.topbar ul a.on { color: var(--text); }
```

---

## 25. Labels, headings and buttons: the shared building blocks

**Where:** `src/index.css`

| Class | What it gives you |
|---|---|
| `.mono` | small uppercase label text: Inter Tight, 12px, wide letter spacing, numbers that line up (`tabular-nums`). A plain 0, no slash |
| `.label` | the `(01) — About` row with a line running to the right (`::after { flex: 1; height: 1px }`) |
| `.big-h` | big section heading, 48–104px with tight letter spacing (`-0.04em`) |
| `em` | Instrument Serif italic in the accent color: `<em>work</em>` |
| `.btn` / `.btn.primary` | round pill buttons; primary is orange; the `→` (`.arr`) slides 4px on hover |
| `.chip` | small rounded tag that glows in the accent color on hover |
| `.wrap` | centers content, max 1320px, with side padding that shrinks on phones |
| `.sec` | standard section spacing (160px top/bottom, 100px on phones) |
| `.panel` | the rounded navy card look for dark sections |

**Font sizes that scale with the screen, using `clamp()`:**
```css
.big-h { font-size: clamp(48px, 6.4vw, 104px); }   /* never below 48, never above 104 */
.name  { font-size: clamp(4.6rem, 22.5vw, 330px); }
```

**A soft glow made with `color-mix()`,** so it uses whatever accent color the section has:
```css
.chip:hover { box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 22%, transparent); }
```

---

## 26. Copy-email button

**Where:** `src/pages/contact.jsx`

```jsx
const [copied, setCopied] = useState(false);
const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(socials.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);              // back to "Copy" after 2s
  } catch {
    window.location.href = `mailto:${socials.email}`;    // if copying isn't allowed, open email instead
  }
};

<button className={`copy mono${copied ? " done" : ""}`} onClick={copyEmail}>
  {copied ? "Copied ✓" : "Copy"}
</button>
```

---

## 27. "Next case study" panel

**Where:** the end of `src/pages/detail.jsx` and `.pd-next` in `detail.css`

**What you see:** a big navy panel with the next project's name. Below it, the top of its screenshot peeks up from the bottom edge. On hover, the name slides right and the screenshot rises fully into view.

```css
.pd-next       { display: block; overflow: clip; }              /* hides the part of the peek below the edge */
.pd-next h2    { transition: transform .8s var(--ease); }
.pd-next:hover h2 { transform: translateX(24px); }
.pd-peek       { transform: translateY(40px); transition: transform 1s var(--ease); }
.pd-next:hover .pd-peek { transform: none; }
```
It wraps around to the first project after the last one: `project[(index + 1) % project.length]`. It uses the curtain transition and `data-cursor="Next case →"`.

---

## 28. Phones and accessibility

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
