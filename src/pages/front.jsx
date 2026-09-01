import CursorGrid from "../components/CursorGrid";
import {motion} from "framer-motion"
import AnimatedContent from "../components/animate";


function Front(){
  
 return(
    <>
    <section className="front" id="front">
      <CursorGrid color="#0A122A" gridOpacity={0.06} />
      <motion.h1 className="name" initial={{opacity:0,y:30}} whileInView={{opacity:1, y:0}} viewport={{ amount:0.2}} transition={{duration:0.5, ease:'easeInOut'}} >ANGHEL</motion.h1>
    </section>
    
    </>
 )
}

export default Front;