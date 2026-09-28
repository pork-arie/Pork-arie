import { testimonials } from "../data/data";
import "../css/testimonials.css";

// Hidden until testimonials in data.jsx has at least one entry
function Testimonials() {
  if (!testimonials.length) return null;

  return (
    <section className="tm" id="testimonials">
      <h2 className="tm-title">What clients say</h2>
      <div className="tm-grid">
        {testimonials.map((t) => (
          <figure className="tm-card" key={t.name}>
            <blockquote>{t.quote}</blockquote>
            <figcaption>
              <strong>{t.name}</strong>
              {t.business && <span>{t.business}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;