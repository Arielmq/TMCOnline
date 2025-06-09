import React, { useState } from 'react'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'
import './ContactTrial.css'

const ContactTrial = () => {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    setSent(true)
    // Aquí puedes agregar lógica para enviar el formulario
  }

  const particlesInit = async (main) => {
    await loadFull(main)
  }

  const particlesOptions = {
    fullScreen: { enable: false },
    background: { color: 'transparent' },
    particles: {
      number: { value: 32 },
      color: { value: '#f7931a' },
      shape: { type: 'circle' },
      opacity: { value: 0.5 },
      size: { value: { min: 2, max: 4 } },
      move: {
        enable: true,
        speed: 1.1,
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'out' }
      }
    }
  }

  return (
    <div className="contactTrial__container">
      <div className="contactTrial__content">
        <div className="contactTrial__box" style={{ position: 'relative', overflow: 'hidden' }}>
          <Particles
            id="contact-trial-particles"
            init={particlesInit}
            options={particlesOptions}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 0,
              pointerEvents: 'none'
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="contactTrial__title">Request your free trial</h2>
            <p className="contactTrial__desc">
              Fill out the form and we’ll contact you to activate your trial account.
            </p>
            {sent ? (
              <div className="contactTrial__success">Thank you! We will contact you soon.</div>
            ) : (
              <form className="contactTrial__form" onSubmit={handleSubmit}>
                <input
                  className="contactTrial__input"
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <input
                  className="contactTrial__input"
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <textarea
                  className="contactTrial__input"
                  name="message"
                  placeholder="Tell us about your mining farm (optional)"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                />
                <button className="contactTrial__button" type="submit">
                  Request Trial
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="contactTrial__img-box">

        <video autoPlay muted playsInline loop src="https://res.cloudinary.com/dd6eoxgul/video/upload/v1749483568/video1_injir2.mp4"></video>

        </div>
      </div>
    </div>
  )
}

export default ContactTrial