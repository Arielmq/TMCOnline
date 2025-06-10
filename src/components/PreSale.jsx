import React, { useEffect, useState } from 'react'
import './PreSale.css'

const PLANS = [
  { name: 'Basic', price: '$19/mo', features: ['Up to 50 miners', 'Basic AI monitoring', 'Email support'] },
  { name: 'Pro', price: '$49/mo', features: ['Up to 500 miners', 'Advanced AI monitoring', 'Priority support'] },
  { name: 'Enterprise', price: 'Custom', features: ['Unlimited miners', 'Full AI suite', 'Dedicated manager'] },
]

const getTimeLeft = () => {
const end = new Date('2025-06-11T00:00:00') // Miércoles 11 de junio
  const now = new Date()
  const diff = end - now
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

const PreSale = () => {
  const [time, setTime] = useState(getTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="preSale__container">
      <div className="preSale__box">
        <h2 className="preSale__title">Pre-Sale Launch</h2>
        <p className="preSale__desc">Reserve your spot before launch and get exclusive benefits!</p>
        <div className="preSale__countdown">
          <div><span>{time.days}</span>days</div>
          <div><span>{time.hours}</span>hrs</div>
          <div><span>{time.minutes}</span>min</div>
          <div><span>{time.seconds}</span>sec</div>
        </div>
        <div className="preSale__plans">
          {PLANS.map(plan => (
            <div className="preSale__plan" key={plan.name}>
              <h3>{plan.name}</h3>
              <div className="preSale__plan-price">{plan.price}</div>
              <ul>
                {plan.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <a  href="#contact"><button style={{padding:"10px"}} className="preSale__plan-btn">Reserve</button></a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PreSale