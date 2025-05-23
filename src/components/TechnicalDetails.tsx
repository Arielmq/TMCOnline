
import React from 'react';
import '../styles/technical-details.css';

const TechnicalDetails = () => {
  const details = [
    { label: 'Blockchain', value: 'Solana SPL' },
    { label: 'Max Supply', value: '500M HASHIRA' },
    { label: 'Token Type', value: 'Utility + Staking' },
    { label: 'KYC', value: 'Required' },
    { label: 'Presale', value: 'In phases' },
    { label: 'Listed on', value: 'Raydium, Jupiter, etc.' },
    { label: 'Wallets', value: 'Phantom, Solflare, Ledger, xNFT' }
  ];

  return (
    <section id="details" className="section technical-details">
      <div className="container">
        <h2 className="section__title technical-details__title animate" style={{ color: '#FFC107' }}>
          <span className="technical-details__icon">🛠️</span> Technical Details
        </h2>
        
        <div className="technical-details__grid animate">
          {details.map((detail, index) => (
            <div key={index} className="technical-details__card sticker">
              <div className="technical-details__label">{detail.label}</div>
              <div className="technical-details__value">{detail.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnicalDetails;
