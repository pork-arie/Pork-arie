# Midnight Studio redesign: what changed and where

A guide to the new portfolio design: the idea behind it, which file controls
each part of the page, and how to edit your content.

---

## 1. The design in short

| Idea | How it shows up |
|---|---|
| **White + navy rhythm** | The page is white. Some sections are dark navy panels with rounded corners. The order is: Front (white) → About (dark) → Toolkit (white) → Work (dark) → Certificates (white) → Process (white) → Kind words (dark) → Contact (white) |
| **Your original front page** | Still white with the CursorGrid. ANGHEL keeps the Oughter font and now slides up letter by letter |
| **Three fonts, each with one job** | **Oughter** for ANGHEL and big numbers. **Inter Tight** for text and the small uppercase labels (its zero is a plain 0, no slash). **Instrument Serif** *italic* for 1–2 accent words per heading |
| **One accent color** | Orange `#FF7A45` only on buttons you should click ("Start a project", "Send message") |
| **Labels** | Every section starts with `(01) — About`, `(02) — Toolkit`… and a thin line |
| **One motion style** | Everything uses the same easing curve, `cubic-bezier(0.22, 1, 0.36, 1)`. Turning on "reduce motion" on a device switches the animations off |
| **Small details** | Film grain, a custom cursor dot (grows over links, shows "View case →" over projects), and a top bar that turns dark or light with the section under it |
| **Mascot** | Unchanged and still on every page |

---

## 2. Where each part lives

### Shared pieces
| File | What it does |
|---|---|
| `index.html` | Loads the Inter Tight and Instrument Serif fonts |
| `src/index.css` | **The design system**: colors, fonts, light/dark themes (`data-theme`), panels, labels, buttons, chips, grain, cursor, curtain |
| `src/nav.css` + `src/parts/nav.jsx` | Fixed top bar (ANGHEL + About / Work / Process / Contact) |
| `src/components/Cursor.jsx` | Custom cursor. Add `data-cursor="Your text"` to any element to show a label over it |
| `src/components/Reveal.jsx` | Wrap anything in `<Reveal>` to make it fade up the first time it scrolls into view |
| `src/components/motion.js` | The shared easing curve |
| `src/components/useBarTheme.js` | Tells a top bar whether it sits over a light or a dark section |
| `src/components/transition.js` | The navy curtain between the home page and the case studies |
| `src/App.jsx` | Section order, plus the grain, curtain, cursor and mascot |

### Home page sections (top to bottom)
| Section | Component | Styles |
|---|---|---|
| Front (white + grid) | `src/pages/front.jsx` | `src/css/hero.css` |
| (01) About | `src/pages/main.jsx` | `src/css/about.css` |
| (02) Toolkit | `src/pages/stack.jsx` | `src/css/toolkit.css` |
| (03) Selected work | `src/pages/featured.jsx` | `src/css/work.css` |
| (04) Certificates | `src/pages/certificates.jsx` (was `projects.jsx`) | `src/css/certificates.css` |
| (05) Process | `src/pages/process.jsx` | `src/css/process.css` |
| (06) Kind words | `src/pages/testimonials.jsx` | `src/css/testimonials.css` |
| (07) Contact | `src/pages/contact.jsx` | `src/css/contact.css` |
| Footer | `src/parts/footer.jsx` | `src/css/footer.css` |

### Case-study page (`/detail/:id`)
| File | What it does |
|---|---|
| `src/pages/detail.jsx` | One template for every project: intro, a tilted showcase, problem / what I built, sideways screens gallery, next project |
| `src/css/detail.css` | Its styles. Each project's accent color comes from `theme` in `data.jsx` |

### Contact email
| File | Change |
|---|---|
| `api/contact.js` (Vercel) and `server/server.js` (local) | The email now includes **"Needs help with: …"** when the visitor picks options on the form |

---

## 3. What each section does

- **Front:** an info row (Web developer · Systems for small businesses · Based in the Philippines · live Manila clock), ANGHEL sliding up, a tagline, and two buttons. The buttons stop short of the right edge so the mascot doesn't cover them.
- **About:** your intro text lights up word by word as you scroll. Your photo still uses **PixelTransition**: hover (or tap on a phone) and it pixel-swaps to the peace-sign photo. Both photos are in full color. The social links sit under the text. The numbers count up, and the first two come from your data: number of projects, number of certificates, and 24h.
- **Toolkit:** three columns (Frontend / Backend / Data) of tool chips.
- **Selected work:** the first project is a wide card, the rest sit two per row. Hovering a card zooms the screenshot and turns the cursor into "View case →". Clicking opens the case study behind a navy curtain.
- **Certificates:** a list of all certificates. On a computer, hovering a row shows a preview that follows the mouse, and clicking opens it full size (Esc or a click closes it). On phones, each row shows the image.
- **Process:** on desktop the section stays in place while a line draws across the 3 steps. On phones it's a simple list.
- **Kind words:** one big quote at a time, switching every 5 seconds. The small bars underneath are clickable.
- **Contact:** "Let's build *something.*", your email with a Copy button, and the "What I offer" list. Next to it is the form: "I need help with" choices, name, email and message, with labels that float up as you type. After sending, a navy "Message sent" panel wipes over the form.
- **Case study:**
  - A big title, the project's own color, and an info strip: Role / Platform / Built for / Stack.
  - The main screenshot starts tilted and flattens as you scroll, with two more screens floating beside it.
  - "The problem" and "What I built" sections.
  - A screens gallery that slides sideways as you scroll down.
  - A large "Next case study" panel.
  - Clicking any screenshot opens it full size.

---

## 4. Editing your content (all in `src/data/data.jsx`)

| To change… | Edit |
|---|---|
| Toolkit chips | `toolkit`: each column has `group`, `title` and `tools` |
| Work card label + one-liner | `kind` (e.g. `"Gym management · Solo project"`) and `short` on each project |
| Case-study info strip | `role`, `platform`, `builtFor`. Stack shows the first 4 of `stack` |
| Case-study color | `theme: { color, soft, glow }` (main color, light tint, glow) |
| Screenshot names in the gallery | `captions`: one name for each of `img`, `img1`, `img2`, `img3` |
| Live site / GitHub buttons | `live`, `github` (leave `""` to hide) |
| Certificate issuer | `issuer` on each certificate |

The "I need help with" choices and the "What I offer" list are at the top of `src/pages/contact.jsx`.

---

## 5. Removed (no longer used)

`src/App.css` (it was empty), `src/css/mobile.css` (each section now has its own phone styles), `src/css/cards.css` + `src/components/Slider.jsx` (the old project/certificate slider), `src/css/feature.css`, `src/css/d.css`, `src/components/animate.jsx`.

The `CursorGrid`, `PixelTransition`, `ParallaxContainer` components and the whole `src/mascot` folder are unchanged.
