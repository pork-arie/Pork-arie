import { useState } from "react";
import {motion} from 'framer-motion'

function Contact() {
  const [formData, setFormdata] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [stat, setStat] = useState(null);

  const handleChange = (e) => {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStat("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setStat("success");
        setFormdata({ name: "", email: "", message: "" });
      } else {
        setStat("error");
      }
    } catch (error) {
      console.log("error", error);
      setStat("error");
    }
  };

  return (
    <>
      <section id="contact" className="bottom-dots-gradient"  >
        <motion.div className="what" initial={{opacity:0, y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.3,ease:"ease"}}>
          <h3>What I Offer</h3>
          <div className="offer-tags" >
            <span>React & Vite Development</span>
            <span>Responsive UI / UX</span>
            <span>Full-Stack Integration</span>
            <span>API & Database Setup</span>
            <span>Smooth Animations</span>
          </div>
        </motion.div>
        <div className="form-container">
          <motion.h1 initial={{opacity:0, y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.3,ease:"ease"}}>contact</motion.h1>
          <motion.form onSubmit={handleSubmit} initial={{opacity:0, y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.3,ease:"ease"}}>
            <div className="ing">
              <label htmlFor="name">Name:</label>

              <input
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                name="name"
                placeholder="Name"
              />
            </div>

            <div className="ing">
              <label htmlFor="email">Email:</label>

              <input
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                name="email"
                placeholder="email"
              />
            </div>

            <div className="ing">
              <label htmlFor="message">Message:</label>

              <textarea
                rows="5"
                required
                value={formData.message}
                onChange={handleChange}
                name="message"
                placeholder="Tell me about your project! Include the goal, timeline, and any features you need.. "
              />
            </div>

            <button type="submit" disabled={stat === "sending"}>
              {stat === "sending" ? "Sending..." : "Send Message"}
            </button>

            {stat === "success" && (
              <p style={{ color: "green" }}>Message sent successfully!</p>
            )}
            {stat === "error" && (
              <p style={{ color: "red" }}>Failed to send. Please try again.</p>
            )}
          </motion.form>
        </div>
      </section>
    </>
  );
}

export default Contact;
