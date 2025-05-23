
import React from 'react';
import '../styles/why-different.css';

const WhoAre = () => {
  return (
    <section id="why" className="section why-different">
      <div className="container">
        <div className="why-different__content">
          <div className="why-different__highlight sticker animate">
           <h2 className="why-different__title" style={{ color: 'var(--gold)' }}>
             Hashira AI: The Foreman Killer Has Arrived.

            </h2>
      
            <p className="why-different__text">
           Powered by cutting-edge artificial intelligence, Hashira AI monitors Bitcoin mining farms in real time with a level of precision and autonomy no other platform has ever reached.

            </p>
            <div className="why-different__separator"></div>
            <div className="why-different__points">
              <div className="why-different__point">
                <div className="why-different__point-icon">✓</div>
                <div className="why-different__point-text"> It powers every transaction within the system
</div>
              </div>
              <div className="why-different__point">
                <div className="why-different__point-icon">✓</div>
                <div className="why-different__point-text">Rewards loyal holders with real utility
</div>
              </div>
              <div className="why-different__point">
                <div className="why-different__point-icon">✓</div>
                <div className="why-different__point-text">Gives you direct influence over the platform’s evolution
</div>
              </div>
            
            </div>
          </div>
          <div className="why-different__image animate">
            <div className="why-different__logo">
              <img src="https://res.cloudinary.com/dd6eoxgul/image/upload/v1748036131/foreman_killer_hfj8tw.jpg" alt="HASHIRA AI Logo"  />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoAre;
