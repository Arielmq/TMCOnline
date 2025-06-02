import React, { useEffect, useState } from 'react'
import { FaEnvelope, FaArrowRight } from 'react-icons/fa'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'
import './HeroContent.css'

const HeroContent = () => {
  const [showTitle, setShowTitle] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowTitle(true), 100)
  }, [])

  // Opciones de partículas metálicas
  const particlesInit = async (main) => {
    await loadFull(main)
  }

  const particlesOptions = {
    fullScreen: { enable: false },
    background: { color: 'transparent' },
    particles: {
      number: { value: 40 },
      color: { value: ['#b0b0b0', '#d4d4d4', '#888', '#e0e0e0'] },
      shape: { type: 'circle' },
      opacity: { value: 0.7 },
      size: { value: { min: 2, max: 5 } },
      move: {
        enable: true,
        speed: 1.2,
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'out' }
      }
    }
  }

  return (
    <div className='hero__content'>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
      <h1 className={`hero__title${showTitle ? ' hero__title--show' : ''}`}>
        Monitored mining<br />
        to the <span style={{color:"white"}}>next level</span>
      </h1>
      <div className="hero__buttons">
        
      </div>
    </div>
  )
}

export default HeroContent