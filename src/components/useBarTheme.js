import { useEffect, useState } from "react";

// For fixed top bars: is the page scrolled, and is the section under the bar
// light or dark? Sections declare it with data-theme="light" | "dark".
export default function useBarTheme() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 40);
      const under = [...document.querySelectorAll("[data-theme]")].find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= 40 && r.bottom > 40;
      });
      setTheme(under?.dataset.theme ?? "light");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return { scrolled, theme };
}
