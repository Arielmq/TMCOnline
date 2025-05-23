
import React, { useState, useEffect } from 'react';
import '../styles/navbar.css';

const Navbar = () => {
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
        
        <nav className={`navbar__menu ${isMobileMenuOpen ? 'navbar__menu--open' : ''}`}>
          <ul className="navbar__list">
            <li className="navbar__item"><a href="#utility" className="navbar__link">Utility</a></li>
            <li className="navbar__item"><a href="#why" className="navbar__link">Why Hashira AI</a></li>
            <li className="navbar__item"><a href="#details" className="navbar__link">Details</a></li>
            <li className="navbar__item"><a href="#ecosystem" className="navbar__link">Ecosystem</a></li>
            <li className="navbar__item"><a href="#roadmap" className="navbar__link">Roadmap</a></li>
            <li className="navbar__item navbar__item--cta">
              <a href="/IndexApp" target="_blank" rel="noopener noreferrer" className="button button--primary">
                Access Platform
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
