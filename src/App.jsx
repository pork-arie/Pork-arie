import { useEffect, useState,useRef } from 'react'
import {Link,BrowserRouter,Routes,Route} from 'react-router-dom'
import  Front  from './pages/front'
import Main  from './pages/main'


import './App.css'
import './nav.css'
import './css/contact.css'
import './css/feature.css'

import Footer from './parts/footer'
import Stack from './pages/stack'
import Projects from './pages/projects'
import Nav from './parts/nav'
import Contact from './pages/contact'
import Featured from './pages/featured'
import Detail from './pages/detail'
import Process from './pages/process'
import Testimonials from './pages/testimonials'
import Mascot from './mascot'


function App() {
  
 

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Front />
                <Nav />
                <Main />
                <Stack />
                <Featured />
                <Projects />
                <Testimonials />
                <Process/>
                <Contact />
                <Footer />
              </>
            }
          />
          <Route path='/detail/:id' element={<Detail/>}/>
        </Routes>
      </BrowserRouter>
      <Mascot size={window.innerWidth < 640 ? 100 : 140} />
      
    </>
  );
 
}

export default App