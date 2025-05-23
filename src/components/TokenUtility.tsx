
import React from 'react';
import '../styles/token-utility.css';

const TokenUtility = () => {
  const utilities = [
    {
      id: 1,
      title: '30% Off Subscriptions',
      description: 'Save 30% on all mining monitoring subscriptions when paying with HASHIRA AI.'
    },
    {
      id: 2,
      title: 'Smart Diagnostics',
      description: 'Get detailed PDF reports about your mining operation performance and health.'
    },
    {
      id: 3,
      title: 'Cloud Mining Discounts',
      description: 'Access special rates on cloud mining services with your HASHIRA AI tokens.'
    },
    {
      id: 4,
      title: 'Premium Features',
      description: 'Unlock premium 3D views, alerts, and advanced health check tools.'
    },
    {
      id: 5,
      title: 'Staking Rewards',
      description: 'Stake your HASHIRA AI tokens and earn passive income from the ecosystem.'
    },
    {
      id: 6,
      title: 'Weekly Raffles',
      description: 'Participate in weekly drawings for hashrate, NFTs, and 3D upgrades.'
    },
    {
      id: 7,
      title: 'Governance Voting',
      description: 'Shape the future of the platform by voting on key decisions and features.'
    }
  ];

  return (
    <section id="utility" className="section token-utility">
      <div className="container">
        <h2 className="section__title token-utility__title animate" style={{ color: '#FFC107' }}>
          <span className="token-utility__icon">🔧</span> Token Utility
        </h2>
        
        <div className="token-utility__content">
          <div className="token-utility__text animate">
            <p className="token-utility__intro">
              HASHIRA AI isn't just another crypto token. It's built with real utility at its core, 
              designed to power the entire mining ecosystem while rewarding token holders.
            </p>
          </div>
          
          <div className="token-utility__grid">
            {utilities.map(utility => (
              <div key={utility.id} className="token-utility__card sticker animate">
                <h3 className="token-utility__card-title">{utility.title}</h3>
                <p className="token-utility__card-desc">{utility.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenUtility;
