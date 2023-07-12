import React from 'react'
import './Social.css'

const Social = () => {
  return (
    <div className="home__social">
        <a 
        href="https://www.instagram.com/pizzablock.ar/" 
        className="home__social-icon" 
        target="_blank"
        >
        <i className="uil uil-instagram-alt"></i>
        </a>

        <a 
        href="https://www.facebook.com/pizzablock.ar/" className="home__social-icon" 
        target="_blank"
        >
        <i className="uil uil-facebook"></i>
        </a>

        <a 
        href="https://wa.me/541151772724" 
        className="home__social-icon" 
        target="_blank"
        >
        <i className="uil uil-whatsapp-alt"></i>
        </a>
    </div>
  )
}

export default Social