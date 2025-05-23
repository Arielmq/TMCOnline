
import React from 'react';
import '../styles/ecosystem.css';

const Ecosystem = () => {
  const features = [
    {
      id: 1,
      title: '3D Immersive Interface',
      description: 'Experience your mining farm in stunning 3D visualization.',
      icon: '🖥️'
    },
    {
      id: 2,
      title: 'Metrics + Alerts Panel',
      description: 'Monitor performance metrics and get real-time alerts.',
      icon: '📊'
    },
    {
      id: 3,
      title: 'Diagnostics',
      description: 'Advanced diagnostics to optimize your mining operations.',
      icon: '🔍'
    },
    {
      id: 4,
      title: 'Cloud Mining',
      description: 'Start mining from just $27/THs without hardware costs.',
      icon: '☁️'
    },
    {
      id: 5,
      title: 'Subscription Plans',
      description: 'Access premium features from only $0.99/month.',
      icon: '💼'
    }
  ];

  return (
    <section id="ecosystem" className="section ecosystem">
      <div className="container">
        <h2 className="section__title ecosystem__title animate" style={{ color: '#FFC107' }}>
          <span className="ecosystem__icon">⚙️</span> Ecosystem
        </h2>
        
        <p className="ecosystem__intro animate">
          HASHIRA AI powers an entire ecosystem of mining-focused products and services.
          Here's what's already live and ready to use:
        </p>
        
        <div className="ecosystem__features">
          {features.map(feature => (
            <div key={feature.id} className="ecosystem__card sticker animate">
              <div className="ecosystem__card-icon">{feature.icon}</div>
              <div className="ecosystem__card-content">
                <h3 className="ecosystem__card-title">{feature.title}</h3>
                <p className="ecosystem__card-desc">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Ecosystem;
