
import React from 'react';
import '../styles/why-different.css';

const WhyDifferent = () => {
  return (
    <section id="why" className="section why-different">
      <div className="container">
        <div className="why-different__content">
          <div className="why-different__highlight sticker animate">
            <h2 className="why-different__title" style={{ color: 'var(--gold)' }}>
              <span className="why-different__icon">🌍</span> Why HASHIRA AI is Different
            </h2>
            <h3 className="why-different__subtitle">
              Built 100% by Miners. For Miners.
            </h3>
            <p className="why-different__text">
              HASHIRA AI links real mining to Web3. No hype. No vaporware. Just utility.
            </p>
            <div className="why-different__separator"></div>
            <div className="why-different__points">
              <div className="why-different__point">
                <div className="why-different__point-icon">✓</div>
                <div className="why-different__point-text">Real mining utility</div>
              </div>
              <div className="why-different__point">
                <div className="why-different__point-icon">✓</div>
                <div className="why-different__point-text">Built by actual miners</div>
              </div>
              <div className="why-different__point">
                <div className="why-different__point-icon">✓</div>
                <div className="why-different__point-text">Working product, not promises</div>
              </div>
              <div className="why-different__point">
                <div className="why-different__point-icon">✓</div>
                <div className="why-different__point-text">Sustainable tokenomics</div>
              </div>
            </div>
          </div>
          <div className="why-different__image animate">
            <div className="why-different__logo">
              <img src="https://res.cloudinary.com/dd6eoxgul/image/upload/v1748027634/removed-removebg-preview_iosrkj.png" alt="HASHIRA AI Logo" className="why-different__logo-img" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyDifferent;
