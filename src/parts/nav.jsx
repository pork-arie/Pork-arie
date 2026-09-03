import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Nav(){
    return(
        <>
        <motion.div className="navwrap" initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}}
        viewport={{amount:0.2}} transition={{duration:0.8, ease:"easeOut"}}
        >
        <nav>
          
          <ul>
            <li><a href="#front">HOME</a></li>
            <li><a href="#main">ABOUT</a></li>
            <li><a href="#proj">PROJECTS</a></li>
            <li><a href="#contact">CONTACT</a></li>
          </ul>
        </nav>


        </motion.div>

        </>
    )
}

export default Nav