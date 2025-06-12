import React, { useState } from 'react'
import { FaCopy, FaExternalLinkAlt } from 'react-icons/fa'
import './TokenSection.css'

const CONTRACT = "58UetGQmMRrkg6gS8cLzdeznMD-HhVob7ved5siAMiBLV"
const COIN_URL = "https://yourcoinwebsite.com"

const TokenSection = () => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTRACT)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <section className="tokenSection__container">
      <div className="tokenSection__img-box">
        <img
          src="https://res.cloudinary.com/dd6eoxgul/image/upload/v1748027634/removed-removebg-preview_iosrkj.png"
          alt="Token"
          className="tokenSection__img"
        />
      </div>
      <div className="tokenSection__info">
        <h2 className="tokenSection__title">HASHIRAAI Token Sale</h2>
        <p className="tokenSection__desc">
          The HashiraAI token powers our ecosystem, enabling access to advanced monitoring, AI features, and exclusive benefits for holders. Be part of the future of mining automation!
        </p>
        <div className="tokenSection__contract-row">
          <span className="tokenSection__contract-label">Contract:</span>
          <span className="tokenSection__contract-value">{CONTRACT}</span>
          <button className="tokenSection__copy-btn" onClick={handleCopy} title="Copy contract">
            <FaCopy />
          </button>
          {copied && <span className="tokenSection__copied">Copied!</span>}
        </div>
    
      </div>
    </section>
  )
}

export default TokenSection