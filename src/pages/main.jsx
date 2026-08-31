import AnimatedContent from "../components/animate";
import d1 from '../assets/d1.jpg'
import peice from '../assets/piece.jpg'
import PixelTransition from "../components/pixel";
import { Link } from "react-router-dom";



function Main(){
 
    return(
        <>
        
        <AnimatedContent duration={1.2} distance={60} delay={0.3}>
        <section className="main">



          <div className="aboutc">
            <div className="ab1">
             <h2 className="mtext" >Hello! I'm Ariel Angel</h2>
             <p className="mtext">Frontend <strong>Web developer</strong>  passionate about React, clean UI, and AI innovation. 
             <br />I turn ideas into interactive web experiences and explore how AI can enhance the way we build and use apps.
              </p>
            </div>

             <div className="ab2">
              <PixelTransition 
              firstContent={<img src={d1} alt="poging lalaki" />}
              secondContent={<img src={peice}/>}
              />
              
             </div>
          </div>
        </section>
        </AnimatedContent>
        
        </>
    )
}

export default Main;