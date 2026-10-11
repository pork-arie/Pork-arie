// Page change with a navy curtain: it rises over the page, the route
// changes behind it, then it lifts off the top. Used between the home page
// and the case-study pages. The curtain element is rendered in App.jsx.
const COVER = 700;

export function goWithCurtain(navigate, to) {
  const body = document.body;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    navigate(to);
    window.scrollTo(0, 0);
    return;
  }
  body.classList.add("pt-leave");
  setTimeout(() => {
    navigate(to);
    window.scrollTo(0, 0);
    body.classList.add("pt-arrive");
    setTimeout(() => {
      // snap the curtain back below the screen without animating it
      body.classList.add("pt-reset");
      body.classList.remove("pt-leave", "pt-arrive");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => body.classList.remove("pt-reset")),
      );
    }, COVER + 50);
  }, COVER);
}
