import { useEffect, useState,useRef } from 'react'
import {Link} from 'react-router-dom'
import  Front  from './pages/front'
import Main  from './pages/main'

import './App.css'

function App() {
  const ref =useRef(null);
  const[p,setP] = useState(0)

  useEffect(() => {
    const pagscroll = () => setP(Math.min(window.scrollY/ window.innerHeight,1));
    window.addEventListener("scroll",pagscroll);
    return () => window.removeEventListener("scroll",pagscroll)
  },[]);
   
  const kadtoMain = () =>
     ref.current.scrollIntoView({behavior:"smooth"})

  return (
    <>
    <Front progress={p} onEnter={kadtoMain}/>
    
    <div style={{ height: "100vh" }} />

    <div ref={ref}>
      <Main/>
    </div>
    
    </>
  )
 
}

export default App
