import { useEffect, useState,useRef } from 'react'
import {Link,BrowserRouter,Routes,Route} from 'react-router-dom'
import  Front  from './pages/front'
import Main  from './pages/main'


import './App.css'
import './nav.css'
import ParallaxContainer from './components/ParallaxContainer'
import Footer from './parts/footer'
import Stack from './pages/stack'
import Projects from './pages/projects'
import Nav from './parts/nav'


function App() {
  
 

  return (
    <>
    
      <Front/>
      <Nav/>
      <Main/>
      <Stack/>
      <Projects/>
      <Footer/>
    


      

     
    </>
  )
 
}

export default App
