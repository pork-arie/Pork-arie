import nwssu from '../assets/certproj/eval.png'
import {motion} from 'framer-motion'
import {project} from '../data/data'

function Featured(){

    return(
        <>
        <section  id="feat" className='dotted-bg'>
            
              <motion.h1 className='fh' initial={{opacity:0, y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.3, ease:'ease'}} viewport={{amount:0.2}}>Recent Projects</motion.h1>
                <div className="fcard">

                 {project.map((pro,index) => (
                    <motion.div className='fcard-con' key={pro.id} initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }} whileInView={{opacity:1,x:0}} transition={{duration:0.3,ease:'ease'}}>
                    <div className='fimg'>
                        <img src={pro.img} alt="img" id='fimg' loading="lazy" />
                    </div>
                    <div className='fname'>
                        <h1>{pro.name}</h1>
                        <p>{pro.description}</p>
                    </div>
                    </motion.div>


                ))}

                </div>
            
        </section>
        </>
    )

}

export default Featured