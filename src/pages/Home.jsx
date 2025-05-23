import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import TokenUtility from '../components/TokenUtility';
import WhyDifferent from '../components/WhyDifferent';
import TechnicalDetails from '../components/TechnicalDetails';
import Ecosystem from '../components/Ecosystem';
import Roadmap from '../components/Roadmap';
import FinalCTA from '../components/FinalCTA';
import WhoAre from "../components/WhoAre"
import Footer from '../components/Footer';
import "../styles/main.css"

const Home = () => {
  useEffect(() => {
    // Initialize animations on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.animate').forEach(el => {
      observer.observe(el);
    });
    
    // Handle smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Adjust for navbar height
            behavior: 'smooth'
          });
        }
      });
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="tmc">
      <Navbar />
      <main className="tmc__main">
        <HeroSection />
        <TokenUtility />
        <WhyDifferent />
        <TechnicalDetails />
        <Ecosystem />
        <Roadmap />
        <FinalCTA />
       < WhoAre />
      </main>
      <Footer />
    </div>
  );
};

export default Home;