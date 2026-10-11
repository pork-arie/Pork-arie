import { useState } from "react";
import Reveal from "../components/Reveal";
import { socials } from "../data/data";
import "../css/contact.css";

const SERVICES = ["Website", "Web system", "Landing page", "UI design", "Something else"];
const OFFERS = [
  "React & Vite development",
  "Responsive UI / UX",
  "Full-stack integration",
  "API & database setup",
  "Smooth animations",
];

function Contact() {
  const [formData, setFormdata] = useState({ name: "", email: "", message: "" });
  const [services, setServices] = useState([]);
  const [stat, setStat] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleService = (s) =>
    setServices((list) => (list.includes(s) ? list.filter((x) => x !== s) : [...list, s]));

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(socials.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${socials.email}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStat("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, service: services.join(", ") }),
      });

      const data = await res.json();

      if (data.success) {
        setStat("success");
        setFormdata({ name: "", email: "", message: "" });
        setServices([]);
      } else {
        setStat("error");
      }
    } catch (error) {
      console.log("error", error);
      setStat("error");
    }
  };

  return (
    <section className="sec contact" id="contact" data-theme="light">
      <div className="contact-aura" aria-hidden="true" />
      <div className="wrap">
        <Reveal className="label">
          <span className="mono">(07) — Contact</span>
        </Reveal>

        <div className="contact-grid">
          <div>
            <Reveal as="h2" className="contact-title">
              Let's build<br /><em>something.</em>
            </Reveal>
            <Reveal as="p" className="contact-lead">
              Tell me what you need. I reply within 24 hours with questions, a rough plan and a timeline.
            </Reveal>
            {socials.email && (
              <Reveal className="contact-mail">
                <a href={`mailto:${socials.email}`}>{socials.email}</a>
                <button type="button" className={`copy mono${copied ? " done" : ""}`} onClick={copyEmail}>
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </Reveal>
            )}
            <Reveal className="offer">
              <h3 className="mono">What I offer</h3>
              <ul>
                {OFFERS.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal as="form" className={`contact-form${stat === "success" ? " done" : ""}`} onSubmit={handleSubmit}>
            <div className="form-head">
              <span className="mono">New inquiry</span>
              <span className="mono">Reply in ~24h</span>
            </div>

            <fieldset className="need">
              <legend className="mono">I need help with</legend>
              <div className="pick">
                {SERVICES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={services.includes(s) ? "on" : ""}
                    aria-pressed={services.includes(s)}
                    onClick={() => toggleService(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="row2">
              <label className="field">
                <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder=" " />
                <span>Your name</span>
              </label>
              <label className="field">
                <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder=" " />
                <span>Email</span>
              </label>
            </div>
            <label className="field">
              <textarea name="message" rows="4" required value={formData.message} onChange={handleChange} placeholder=" " />
              <span>Tell me about your project: goal, timeline, features</span>
            </label>

            <button type="submit" className="send" disabled={stat === "sending"}>
              <span>{stat === "sending" ? "Sending…" : "Send message"}</span>
              <span aria-hidden="true">→</span>
            </button>

            {stat === "error" && (
              <p className="form-error" role="alert">
                Couldn't send your message. Please try again, or email me at {socials.email}.
              </p>
            )}

            {/* navy panel that wipes up over the form once it's sent */}
            <div className="sent" role="status" aria-hidden={stat !== "success"}>
              <b aria-hidden="true">✓</b>
              <div>
                <strong>Message sent.</strong>
                <p>Thanks! I'll reply within 24 hours.</p>
                <button type="button" className="mono" onClick={() => setStat(null)}>
                  Send another
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default Contact;
