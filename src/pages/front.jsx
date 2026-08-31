import CursorGrid from "../components/CursorGrid";
import AnimatedContent from "../components/animate";


function Front(){
  
 return(
    <>
    <section className="front">
      <CursorGrid color="#0A122A" gridOpacity={0.06} />
      <AnimatedContent delay={0.3} duration={1}><h1 className="name">ANGHEL</h1></AnimatedContent>
    </section>
    
    </>
 )
}

export default Front;