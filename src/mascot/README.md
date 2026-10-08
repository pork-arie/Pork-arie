# Cat in a Fish Suit — the mascot

Everything for the mascot lives in this folder. This guide covers how to use it,
how it works, and how the images were made, so you can change it or build your own.

```
src/mascot/
├── index.js              ← what App.jsx imports
├── Mascot.jsx            ← all the behaviour (React component)
├── Mascot.css            ← all the movement styles (CSS animations)
├── assets/
│   ├── layers/           ← the original 3D artwork, cut into moving parts
│   └── animations/       ← one image strip per animation (walk, run, sleep…)
└── tools/                ← Python scripts that made the images above
    └── source/           ← the original pictures the scripts start from
```

---

## 1. Using it

It's already on your site. In `src/App.jsx`:

```jsx
import Mascot from './mascot'
// …
<Mascot size={window.innerWidth < 640 ? 100 : 140} />
```

`size` is the width in pixels. To remove the mascot, delete that line.

To use it in another React project, copy the whole `mascot` folder (you can
leave out `tools/`) and add the same two lines.

---

## 2. How it works

### Idea 1: the mascot has two "looks"

| When | What's on screen | Where |
|---|---|---|
| normal, hovering | the **original 3D picture**, split into layers | `assets/layers/` |
| everything else | a **flipbook** animation | `assets/animations/` |

The `state` variable in `Mascot.jsx` decides which one is shown. It's a
priority list: the first thing that's true wins.

```js
const state =
  moving?.anim ??                                   // walking/running somewhere
  (flying ? "panic" : dragging ? "drag" : null) ??   // being thrown / held
  override ??                                       // a reaction that's playing (jump, wave…)
  (sleeping ? "sleep" : hovering ? "hover" : "neutral");
```

If `state` is the name of an animation in `ANIMS`, the flipbook plays.
Otherwise the layered 3D picture is shown.

### Idea 2: layers make a still picture move

`assets/layers/` holds the 3D picture cut into pieces:

- **`base.webp`**: the body, with the eyes, mouth, tail and paw painted out.
- **`eyeL`, `eyeR`, `pupilL`, `pupilR`, `mouth`, `paw`, `tail`**: the cut-out parts.

They're stacked back together in an `<svg>`, each at its original position
(the `P` table in `Mascot.jsx`). Because every part is its own element, CSS
and JavaScript can move each one separately:

- **Eyes follow the cursor.** `lookAt()` measures the direction from the
  mascot to the mouse and slides the eye layers a few pixels that way
  (`translate(...)`). The fish-suit pupils are clipped to an ellipse (the
  `clipPath`), so they can't slide out of the white of the eye.
- **Blinking.** Every 2–5 seconds a timer adds the class `is-blinking`, and CSS
  squashes the eyes flat (`scaleY(0.08)`) for 160 ms.
- **Wagging tail.** A CSS `@keyframes m-wag` rotates the tail back and forth.
  `transform-origin` is set to where the tail joins the body, so it swings
  from there.

### Idea 3: a flipbook is one long image

Each file in `assets/animations/` is a strip of frames side by side:

```
walk.webp:  [frame 1][frame 2][frame 3][frame 4][frame 5][frame 6][frame 7]
```

The `Sprite` component shows the strip as a CSS background that's 7 times
wider than the box, so only one frame fits. A timer then slides the
background along, one frame at a time:

```js
el.style.backgroundPositionX = `${(frame / (frames - 1)) * 100}%`;
```

`fps` in `ANIMS` sets the speed. `once: true` stops on the last frame (for
example lying asleep). `reverse: true` plays it backwards: `wake` is just the
`sleep` strip played backwards.

### Idea 4: reactions are timers

```js
react("wave", null, 1800, { text: "Hi!", fx: "💙" });
```

This shows the `wave` animation for 1800 ms, puts "Hi!" in the speech bubble
and floats a 💙. Internally it sets `override = "wave"` and starts a timer
that sets it back to `null`.

Every interaction is wired up the same way:

| Trigger | Code |
|---|---|
| click | `onClick` → `randomReaction()` picks from `REACTIONS` |
| 5 fast clicks | `onClick` counts clicks in the last 1.5 s → angry |
| rubbing the cursor | `detectPetting` counts left/right direction changes |
| cursor leaves the page | `mouseout` with no `relatedTarget` → sad |
| fast scroll | `onScroll` compares scroll positions |
| idle 20 s | the `wake()` timer → sleep |
| idle wander | a 1-second interval that sometimes calls `moveTo()` |

### Idea 5: dragging, throwing and walking

- **Drag.** `onPointerDown` calls `setPointerCapture` (so the drag keeps
  working even if the mouse leaves the mascot). `onPointerMove` moves the
  box. It also records the last few mouse positions.
- **Throw.** On release, those positions give the speed (`vx`, `vy`). If it's
  fast, `fling()` runs a tiny physics loop with `requestAnimationFrame`. Every
  frame it adds gravity (`vy += 0.9`), moves, and bounces off the screen edges
  by flipping and shrinking the speed (`vx = -vx * 0.6`).
- **Walk/run.** `moveTo()` uses the same kind of loop: move a few pixels per
  frame until it arrives. The strip is mirrored (`scaleX(-1)`) when walking left.
- **Remembering its spot.** The position is saved in `localStorage`, so the
  mascot stays where visitors left it.

---

## 3. Recipes: things you can change

| I want to… | Change this in `Mascot.jsx` |
|---|---|
| change what it says when clicked | the `say: [...]` lists in `REACTIONS` |
| make it fall asleep later | `SLEEP_AFTER = 20000` (milliseconds) |
| make an animation faster | its `fps` in `ANIMS` |
| add a click reaction | add `{ anim: "look", ms: 2000, say: ["Hello!"] }` to `REACTIONS` |
| stop it wandering | delete the `useEffect` under "While idle: now and then look around…" |
| change the floating emoji | the `fx: "💙"` values |
| make it bigger | `size={…}` in `App.jsx` |

After changing anything, run `npm run dev` and look at the page.

---

## 4. How the images were made (`tools/`)

You only need this to rebuild the images or make a new character.

### Setup (once)

```bash
cd src/mascot/tools
pip install -r requirements.txt
mkdir out
```

### Step 1: cut the character out of the picture

```bash
python 1_cutout.py source/mascot-art.webp out/cutout.png --box 125 55 800 935
```

**Technique: GrabCut.** You give it rough hints: "this border is background,
this dark-blue area is surely the character". It learns the colours of each
side and decides every pixel in between. The result is a PNG with a
transparent background.

### Step 2: split it into moving layers

```bash
python 2_make_layers.py out/cutout.png ../assets/layers
```

1. **Find each part with a colour rule in a small area.** For example, an eye
   is "everything that isn't cream-coloured near (257, 470)". The positions
   are in `PARTS` at the top of the script.
2. **Save each part** as its own transparent image.
3. **Inpaint the base.** Where a part was cut out, fill the hole by
   repeatedly averaging the surrounding pixels (`smooth_fill`). Then when an
   eye blinks, you see smooth skin behind it instead of a hole.

It prints the `P` and `SCLERA` tables. If you change the artwork, paste them
into `Mascot.jsx`.

### Step 3: turn the animation sheets into strips

```bash
python 3_make_animations.py out/cutout.png ../assets/animations
```

The sheets are in `source/hd/`: one image per animation, with the poses in a
row on a white background (`walk.webp`, `sleep.webp`, `drag.webp`…). For each
one listed in `ANIMS` at the top of the script:

1. **Find the frames.** Each dark-blue blob is one character.
2. **Cut each frame out.** A "paint-bucket" fill from the edges removes the
   white background. Warm cream pixels next to the body are always kept, so
   side-view faces don't turn see-through.
3. **Resize** so the character matches the original picture's height and
   head size (measured automatically). Then switching between the normal pose
   and an animation looks like one body, not a sudden resize.
4. **Colour-match** the suit to the original picture. It shifts the average
   colour and contrast in Lab colour space so the sprites blend in.
5. **Line up** the frames with their feet on the bottom edge (or, for `drag`,
   with the fin tip in the same place, because that's where the cursor holds
   him), and save one strip.

Strips are saved at **2× resolution** (`--hd 2`, the default) so they stay
sharp on phones and retina screens; the CSS shrinks them to fit.

It prints the `ANIMS` frame counts. If they change, copy them into `ANIMS` in
`Mascot.jsx`.

**Adding a new animation.** Put a sheet in `source/hd/` (poses in one row,
white background, a little gap between poses), add a line to `ANIMS` in the
script, and run step 3. If the sheet has labels, use `crop` to leave them out
or `hide` to paint over them. Use `skip` to leave out a frame that doesn't
fit. Then import the new strip in `Mascot.jsx` and add it to `ANIMS` there.

---

## 5. Try it yourself (exercises)

1. Add the message "Thanks for visiting!" to the jump reaction.
2. Make the mascot fall asleep after 5 seconds, then put it back to 20.
3. Make the `excited` animation twice as fast.
4. Make double-click play `wave`. Hint: in `onClick`, check whether the
   last two clicks were less than 300 ms apart.
5. Harder: make the mascot `run` to the other side of the screen when it's
   poked 5 times, using `moveTo(...)`.
