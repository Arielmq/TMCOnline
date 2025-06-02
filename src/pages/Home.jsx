
import HeroContent from '../components/HeroContent'
import AboutUs from '../components/AboutUs'
import './home.css'
import HowItWorks from '../components/HowItWorks'
import PreSale from "../components/PreSale"
import Contact from '../components/ContactTrial'
import Footer from '../components/Footer'
import TokenSection from '../components/TokenSection'
import GallerySection from '../components/GallerySection'
import { useEffect, useState } from 'react'

function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };



  return (
    <>
      <header className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__container">
        <div className="navbar__logo">
          <img src="https://res.cloudinary.com/dd6eoxgul/image/upload/v1748027634/removed-removebg-preview_iosrkj.png" alt="Hashira AI Logo" className="navbar__logo-img" />
        </div>
        
        <button className="navbar__toggle" onClick={toggleMobileMenu}>
          <span className="navbar__toggle-bar"></span>
          <span className="navbar__toggle-bar"></span>
          <span className="navbar__toggle-bar"></span>
        </button>
        
        <nav  className={`navbar__menu ${isMobileMenuOpen ? 'navbar__menu--open' : ''}`}>
          <ul className="navbar__list">
          
            <li className="navbar__item"><a href="#why" style={{color:"black",filter:"drop-shadow(0px 0px 2px orange)"}} className="navbar__link">Why Hashira AI</a></li>
            <li className="navbar__item"><a href="#details" style={{color:"black",filter:"drop-shadow(0px 0px 2px orange)"}} className="navbar__link">Details</a></li>
            <li className="navbar__item"><a href="#ecosystem" style={{color:"black",filter:"drop-shadow(0px 0px 2px orange)"}} className="navbar__link">Ecosystem</a></li>
            <li className="navbar__item"><a href="#roadmap" style={{color:"black",filter:"drop-shadow(0px 0px 2px orange)"}} className="navbar__link">Roadmap</a></li>
            <li className="navbar__item navbar__item--cta">
              <a style={{backgroundColor:"orange",padding:"10px",borderRadius:"5px",color:"black",fontWeight:"bold"}} href="/app" target="_blank" rel="noopener noreferrer" className="button button--primary">
                Access Platform
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
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