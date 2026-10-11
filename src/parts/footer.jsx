import { socials } from "../data/data";
import "../css/footer.css";

function Footer() {
  const links = [
    ["GitHub", socials.github],
    ["LinkedIn", socials.linkedin],
    ["Instagram", socials.instagram],
    ["Facebook", socials.facebook],
  ].filter(([, url]) => url);

  return (
    <footer className="site-footer" data-theme="light">
      <div className="wrap">
        <span className="mono">© {new Date().getFullYear()} Anghel · Philippines</span>
        <ul>
          {links.map(([name, url]) => (
            <li key={name}>
              <a className="mono" href={url} target="_blank" rel="noreferrer">{name}</a>
            </li>
          ))}
          <li>
            <a className="mono" href="#front">Back to top ↑</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
