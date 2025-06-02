

import HeroContent from '../components/HeroContent'
import AboutUs from '../components/AboutUs'
import './indexApp.css'
import HowItWorks from '../components/HowItWorks'
import PreSale from "../components/PreSale"
import Contact from '../components/ContactTrial'
import Footer from '../components/Footer'
import TokenSection from '../components/TokenSection'
import GallerySection from '../components/GallerySection'

function Home() {
  return (
    <>
      <main>
        <NavBar />
      </main>
      <section id="why">
        <HeroContent />
      </section>
      <section id="details">
        <AboutUs />
      </section>
      <section id="ecosystem" className='bgSectionCont'>
        <HowItWorks />
        <Contact />
        <PreSale />
      </section>
      <section id="roadmap">
        <GallerySection />
        <TokenSection />
      </section>
      <Footer />
    </>
  )
}
export default Home