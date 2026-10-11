import { useEffect, useState } from "react";
import useBarTheme from "../components/useBarTheme";

const LINKS = [
  ["About", "main"],
  ["Work", "work"],
  ["Process", "process"],
  ["Contact", "contact"],
];

// Fixed top bar. It reads the data-theme of the section underneath it so it
// turns dark on white sections and light on the dark panels, and it
// highlights the link of the section you're currently in.
function Nav() {
  const { scrolled, theme } = useBarTheme();
  const [active, setActive] = useState("");

  useEffect(() => {
    const update = () => {
      let on = "";
      LINKS.forEach(([, id]) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) on = id;
      });
      setActive(on);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`topbar${scrolled ? " scrolled" : ""}`} data-on={theme}>
      <div className="wrap">
        <a className="brand" href="#front">ANGHEL</a>
        <nav aria-label="Sections">
          <ul>
            {LINKS.map(([name, id]) => (
              <li key={id}>
                <a href={`#${id}`} className={active === id ? "on" : ""}>{name}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Nav;
