import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Front from './pages/front'
import Main from './pages/main'

import './nav.css'

import Footer from './parts/footer'
import Stack from './pages/stack'
import Certificates from './pages/certificates'
import Nav from './parts/nav'
import Contact from './pages/contact'
import Featured from './pages/featured'
import Detail from './pages/detail'
import Process from './pages/process'
import Testimonials from './pages/testimonials'
import Mascot from './mascot'
import Cursor from './components/Cursor'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Nav />
                <Front />
                <Main />
                <Stack />
                <Featured />
                <Certificates />
                <Process />
                <Testimonials />
                <Contact />
                <Footer />
              </>
            }
          />
          <Route path='/detail/:id' element={<Detail/>}/>
        </Routes>
      </BrowserRouter>
      <Mascot size={window.innerWidth < 640 ? 100 : 140} />
      <div className="grain" aria-hidden="true" />
      <Cursor />
    </>
  );
}

export default App
