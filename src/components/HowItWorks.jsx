import React, { useState } from 'react'
import './HowItWorks.css'

const steps = [
  {
    title: 'AI Monitoring',
    content: 'Our AI constantly analyzes your mining farm’s performance, detecting anomalies and optimizing efficiency in real time.',
    img: 'https://res.cloudinary.com/dllkefj8m/image/upload/v1747763336/tild3231-3637-4463-a638-333539346434__8_immerse_1_f9mfoa.png'
  },
  {
    title: 'Health Check',
    content: 'The program constantly analyzes all machines, searching for and reporting errors on each one to maintain optimal operation.',
    img: 'https://res.cloudinary.com/dllkefj8m/image/upload/v1747763336/tild3231-3637-4463-a638-333539346434__8_immerse_1_f9mfoa.png'
  },
  {
    title: 'User-Friendly Interface',
    content: 'Unlike Foreman or Whatsminer, which have difficult and complicated interfaces, our platform is designed to be intuitive and easy to use for everyone.',
    img: 'https://res.cloudinary.com/dllkefj8m/image/upload/v1747763336/tild6132-3532-4634-b362-303064656531__128_immerse_1_f7tpuv.png'
  },
  {
    title: 'Remote Control',
    content: 'Manage and adjust your mining equipment remotely, from anywhere in the world, with just a few clicks.',
    img: 'https://res.cloudinary.com/dllkefj8m/image/upload/v1747763336/tild6132-3532-4634-b362-303064656531__128_immerse_1_f7tpuv.png'
  },
]

const HowItWorks = () => {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="howItWorks">

    <div className="howItWorks__container">
      <h2 className="howItWorks__title">How it works</h2>
   <div className='howItWorks__flexDiv' style={{ display: 'flex', gap: '20px', flexDirection: 'row', alignItems: 'center',justifyContent: 'center' ,margin:" 0 auto"}}> 
      <div className="howItWorks__image">
        <img src={steps[openIndex].img} alt={steps[openIndex].title} />
      </div>
      <div className="howItWorks__steps">
        {steps.map((step, idx) => (
          <div className="howItWorks__dropdown" key={step.title}>
            <button
              className={`howItWorks__dropdown-btn${openIndex === idx ? ' active' : ''}`}
              onClick={() => setOpenIndex(idx)}
              aria-expanded={openIndex === idx}
            >
              {openIndex === idx && (
                <video
                  className="howItWorks__dropdown-btn-bg"
                  src="https://res.cloudinary.com/dllkefj8m/video/upload/v1748372091/Black_Neon_Blue_Starfield_Galaxy_Flash_Countdown_Video_Message_vpp86u.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
              <span className="howItWorks__dropdown-btn-text">{step.title}</span>
            </button>
            <div
              className={`howItWorks__dropdown-content${openIndex === idx ? ' open' : ''}`}
              style={{ maxHeight: openIndex === idx ? '200px' : '0px' }}
            >
              <p>{step.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
     </div>
  )
}

export default HowItWorks