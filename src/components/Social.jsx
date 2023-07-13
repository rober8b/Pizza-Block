import React from 'react'
import './Social.css'
import instagramLogo from '../assets/instagram-logo.png'

const Social = () => {
  return (
    <div className="home__social">
        <a 
        href="https://www.instagram.com/pizzablock.ar/" 
        className="home__social-icon" 
        target="_blank"
        >
        <img src={instagramLogo} alt="logo de instagram" />
        </a>

        <a 
        href="https://www.facebook.com/pizzablock.ar/" className="home__social-icon facebook" 
        target="_blank"
        >
        <i className="uil uil-facebook"></i>
        </a>

        <a 
        href="https://wa.me/541151772724" 
        className="home__social-icon whatsapp" 
        target="_blank"
        >
        <i className="uil uil-whatsapp-alt"></i>
        </a>
    </div>
  )
}

export default Social