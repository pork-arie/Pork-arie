import { useEffect, useState } from "react"
import {motion, AnimatePresence} from  "framer-motion" 
import d1 from '../assets/d1.jpg'
import {certificates} from '../data/data.jsx'


function Projects(){
 const[show,setShow] = useState('proj')
 
 
    return(
        <>
        <section className="proj" id="proj">
           
           <div className="scroll">
               <span className="big-bg-text">PROJECTS</span>
           </div>
           

          <motion.div className="bcon" initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.3,ease:'ease'}}>
           <button id="bt" className={show === 'proj' ? 'active' : ''} onClick={() => setShow('proj')}>PROJECTS</button>
           <button id="bt" className={show === 'cert' ? 'active' : ''} onClick={() => setShow('cert')}>CERTIFICATES</button>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div className="projCon" key={show} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:0.3}}>
                {
                    show === 'proj' ? (
                        <div className="projlist">
                            <div className="projCard">
                                <img src={d1} loading="lazy"/>
                                <h2>projects HAHAHAH</h2>
                                <p>description</p>
                                <button className="check">check</button>
                            </div>
                            <div className="projCard">
                                <h2>projects HAHAHAH</h2>
                            </div>
                            <div className="projCard">
                                <h2>projects HAHAHAH</h2>
                            </div>
                        </div>
                    ) : (
                        <div className="certlist" >

                         {certificates.map((prod) => (
                           <motion.div className="projCard" key={prod.id} >
                                <img src={prod.img} loading="lazy"/>
                                <h2>{prod.name}</h2>
                                <p>{prod.description}</p>
                                 
                                <button className="check">check</button>
                            </motion.div>
                         ))}
                            
                        </div>
                    )
                }

            </motion.div>

            

          </AnimatePresence>
        </section>
        </>
    )
}

export default Projects