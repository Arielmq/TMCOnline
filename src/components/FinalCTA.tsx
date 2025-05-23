
import React from 'react';
import '../styles/final-cta.css';

const FinalCTA = () => {
  return (
    <section id="details" className="section final-cta">
      <div className="final-cta__overlay"></div>
      <div className="container final-cta__container">
        <h2 className="final-cta__title animate" style={{ color: 'var(--gold)' }}>
          HASHIRA AI bridges real hashrate with digital decentralization.
        </h2>
        
        <div className="final-cta__actions animate">
          <a href="/IndexApp" target="_blank" rel="noopener noreferrer" className="button button--primary final-cta__button">
            Access Platform
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
