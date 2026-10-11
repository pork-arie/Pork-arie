import { motion } from "framer-motion";
import { EASE } from "./motion";

// Fades + slides its children up once, the first time they scroll into view.
// Same timing and easing everywhere so the whole site moves the same way.
function Reveal({ as = "div", delay = 0, y = 40, children, ...rest }) {
  const Tag = motion[as];
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.1, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
