
import React from 'react';
import { Copy } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import '../styles/hero.css';

const HeroSection = () => {
  const contractAddress = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      toast.success('Contract address copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy contract address');
    }
  };

  return (
    <section className="hero">
      <div className="hero__overlay"></div>
      <div className="container hero__container">
        <div className="hero__content">
          <h1 className="hero__title" style={{ color: '#FFB81C' }}>
            HASHIRA AI – The Token Connecting Real Mining to Web3
          </h1>
          <p className="hero__subtitle">
            Pay, mine, govern and earn. All with a single token.
          </p>
          <div className="hero__cta">
            <a href="#details" className="button button--secondary">Learn More</a>
          </div>
          <div className="hero__wallets">
            <p className="hero__wallets-title">Supported Wallets:</p>
            <div className="hero__wallet-icons">
              <div className="hero__wallet-icon">
                <span>Phantom</span>
              </div>
              <div className="hero__wallet-icon">
                <span>Solflare</span>
              </div>
              <div className="hero__wallet-icon">
                <span>Ledger</span>
              </div>
              <div className="hero__wallet-icon">
                <span>xNFT</span>
              </div>
            </div>
          </div>
          <div className="hero__contract">
            <p className="hero__contract-title">Token Contract:</p>
            <div className="hero__contract-info">
              <div className="hero__contract-address">
                <span className="hero__contract-label">Contract Address:</span>
                <div className="hero__contract-address-container">
                  <code className="hero__contract-value">{contractAddress}</code>
                  <button 
                    onClick={copyToClipboard}
                    className="hero__contract-copy-btn"
                    title="Copy contract address"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <div className="hero__contract-network">
                <span className="hero__contract-label">Network:</span>
                <span className="hero__contract-value">Solana</span>
              </div>
              <div className="hero__contract-symbol">
                <span className="hero__contract-label">Symbol:</span>
                <span className="hero__contract-value">HASHIRA</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero__image">
          <div className="hero__tmc-coin float">
            <img src="https://res.cloudinary.com/dd6eoxgul/image/upload/v1748027634/removed-removebg-preview_iosrkj.png" alt="Hashira AI Coin" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
