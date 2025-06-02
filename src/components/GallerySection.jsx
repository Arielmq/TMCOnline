import React from 'react'
import './GallerySection.css'

const galleryData = [

  {
    img: 'https://res.cloudinary.com/dd6eoxgul/image/upload/v1748380503/details_s4bqnw.png',
    title: 'Detailed Analytics',
    desc: 'Access detailed analytics and historical data to optimize your mining strategy and maximize profits.',
    imgLeft: false,
  },
  {
    img: 'https://res.cloudinary.com/dd6eoxgul/image/upload/v1748380505/imagen1panel_jyomt5.png',
    title: 'Unified Dashboard',
    desc: 'Monitor all your miners from a single, intuitive dashboard. Stay in control wherever you are.',
    imgLeft: true,
  },
  {
    img: 'https://res.cloudinary.com/dllkefj8m/image/upload/v1748373964/miners_kpioxb.png',
    title: 'Hardware Overview',
    desc: 'See the status of your hardware at a glance and detect issues before they become problems.',
    imgLeft: false,
  },
    {
    img: 'https://res.cloudinary.com/dd6eoxgul/image/upload/v1748380502/ir_v1eqea.png',
    title: 'Instant Reports',
    desc: 'Get instant reports of your mining operation with a single click. Visualize performance and issues in real time.',
    imgLeft: true,
  },
]

const GallerySection = () => (
  <section className="gallerySection__container" id="gallery">
    {galleryData.map((item, idx) => (
      <div
        className={`gallerySection__row${item.imgLeft ? '' : ' gallerySection__row--reverse'}`}
        key={item.title}
      >
        <div className="gallerySection__img-box">
          <img src={item.img} alt={item.title} className="gallerySection__img" />
        </div>
        <div className="gallerySection__text">
          <h3 className="gallerySection__title">{item.title}</h3>
          <p className="gallerySection__desc">{item.desc}</p>
        </div>
      </div>
    ))}
  </section>
)

export default GallerySection