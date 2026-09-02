import { useNavigate, useParams } from "react-router-dom"
import { useRef, useState } from "react"

import {project} from '../data/data'
import { div } from "framer-motion/client"

function Detail(){
     const {id} = useParams()
     const nav = useNavigate()

     const [view,setView] = useState(null)

     const ref = useRef(null)

     const left = () => {
        ref.current?.scrollBy({left:-360,behavior:'smooth'})
     }

     const rigth = () => {
        ref.current?.scrollBy({left:360,behavior:'smooth'})
     }

     const pro = project.find((p) => p.id === Number(id))

    return(
        <>
        <section className="D">
            <button className='back'onClick={() => nav('/')}>back</button>
            <div className="dd">

                <div className="slides" >
                    <button className='dscroll left'onClick={left}>le</button>

                <div className="pics" ref={ref} >
                    <img src={pro.img} alt="" id="dimg" onClick={() => setView(pro.img)}/>
                    
                </div>
                    <button className='dscroll rigth' onClick={rigth}>ri</button>

                </div>

 

                <h1>{pro.name}</h1>
                <p>{pro.description}</p>
            </div>

            {view && (
                <div className="lightbox-overlay" onClick={() =>  setView(null)}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img src={view}/>
                    </div>
                </div>
           )}

        </section>
        
        
       

        </>
    )
}

export default Detail