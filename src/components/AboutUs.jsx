import React, { useRef, useEffect, useState } from 'react'
import './AboutUs.css'

const AboutUs = () => {
  const imgRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (imgRef.current) observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className='aboutUs__cont'>
      <div
        className={`aboutUs__img-cont ${visible ? 'aboutUs__img-cont--visible' : ''}`}
        ref={imgRef}
      >
        <img
          className="aboutUs__img"
          src="https://res.cloudinary.com/dd6eoxgul/image/upload/v1747931441/tmc1_hedqka.jpg"
          alt="AI monitoring mining farm"
        />
        <div className="aboutUs__info-overlay">
          <h2 className="aboutUs__title">About Us</h2>
          <p className="aboutUs__desc">
            We are a software solution powered by AI, designed to make life easier for users by monitoring their mining farms. Our platform provides intelligent insights and real-time data,<span style={{color:"black",fontWeight:"bold", textShadow: "0px 0px 10px #f7931a"}}> helping you optimize and secure your operations effortlessly.</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutUs