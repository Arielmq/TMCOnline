import NavBar from './components/NavBar'
import { useState } from 'preact/hooks'
import HeroContent from './components/HeroContent'
import AboutUs from './components/AboutUs'
import './app.css'
import HowItWorks from './components/HowItWorks'
import PreSale from "./components/PreSale"
import Contact from './components/ContactTrial'
import Footer from './components/Footer'
import TokenSection from './components/TokenSection'
import GallerySection from './components/GallerySection'
export function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <main>
        <NavBar></NavBar>
      </main>
      <section>
        <HeroContent></HeroContent>
      </section>
        <AboutUs></AboutUs>
        <section className='bgSectionCont'>
        <HowItWorks></HowItWorks>
      <Contact></Contact>
      <PreSale></PreSale>
      </section>
      <GallerySection></GallerySection>
      <TokenSection></TokenSection>
      <Footer></Footer>
    </>
  )
}
