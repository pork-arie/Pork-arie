import { useEffect, useState,useRef } from 'react'
import {Link,BrowserRouter,Routes,Route} from 'react-router-dom'
import  Front  from './pages/front'
import Main  from './pages/main'


import './App.css'
import './nav.css'
import Footer from './parts/footer'

function App() {
  
   


  return (
    <>
    
    <BrowserRouter>
     <Routes>
        <Route path='/' element={<Front/>}/>
        <Route path='/main' element={<Main/>}/>
      </Routes>
    </BrowserRouter>
    <Main/>
    <Footer/>
    
     
   
    
    

    </>
  )
 
}

export default App
