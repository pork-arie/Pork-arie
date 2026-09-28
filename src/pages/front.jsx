import CursorGrid from "../components/CursorGrid";
import { motion } from "framer-motion";

function Front() {
  return (
    <>
      <section className="front" id="front">
        <CursorGrid color="#0A122A" gridOpacity={0.06} />
        <motion.h1
          className="name"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          ANGHEL
        </motion.h1>

        {/* what I do + what to do next, readable in the first 5 seconds */}
        <motion.div
          className="front-intro"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
        >
          <p className="front-tagline">
            Web developer building websites and systems for small businesses in the Philippines.
          </p>
          <div className="front-cta">
            <a href="#contact" className="front-btn is-primary">Start a project</a>
            <a href="#proj" className="front-btn">See my work</a>
          </div>
        </motion.div>
      </section>
    </>
  );
}

export default Front;