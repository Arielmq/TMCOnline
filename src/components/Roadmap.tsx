
import React from 'react';
import '../styles/roadmap.css';

const Roadmap = () => {
  const milestones = [
    {
      id: 1,
      title: 'MVP Live',
      description: 'First version of the platform successfully launched.',
      status: 'completed',
      icon: '✅'
    },
    {
      id: 2,
      title: 'KYC + Subs Enabled',
      description: 'KYC verification and subscriptions activated.',
      status: 'completed',
      icon: '✅'
    },
    {
      id: 3,
      title: 'Public Presale',
      description: 'HASHIRA AI token public presale phase begins.',
      status: 'upcoming',
      icon: '🔜'
    },
    {
      id: 4,
      title: 'Staking + Rewards',
      description: 'Staking platform launch with reward mechanisms.',
      status: 'upcoming',
      icon: '🔜'
    },
    {
      id: 5,
      title: 'NFT Marketplace',
      description: 'Launch of mining-focused NFT marketplace.',
      status: 'upcoming',
      icon: '🔜'
    },
    {
      id: 6,
      title: 'Mobile + Multigranja App',
      description: 'Mobile app with multi-farm support.',
      status: 'upcoming',
      icon: '🔜'
    }
  ];

  return (
    <section id="roadmap" className="section roadmap">
      <div className="container">
        <h2 className="section__title roadmap__title animate" style={{ color: '#FFC107' }}>
          <span className="roadmap__icon">🧩</span> Roadmap
        </h2>
        
        <div className="roadmap__timeline">
          {milestones.map((milestone, index) => (
            <div 
              key={milestone.id} 
              className={`roadmap__item animate ${milestone.status === 'completed' ? 'roadmap__item--completed' : ''}`}
            >
              <div className="roadmap__connector"></div>
              <div className="roadmap__milestone sticker">
                <div className="roadmap__icon-wrapper">
                  <span className="roadmap__milestone-icon">{milestone.icon}</span>
                </div>
                <h3 className="roadmap__milestone-title">{milestone.title}</h3>
                <p className="roadmap__milestone-desc">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
