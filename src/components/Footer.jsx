import React from 'react'
import logo from '../assets/logo.png';
import './Footer.css'
import delivery_image from '../assets/delivery.png'
import instagramLogo from '../assets/instagram-logo.png'


const Footer = () => {
  return (
    <div className="Footer">
        <div className='Footer_container'>

            <div className="footer_logo-container">
                <img className='footer_logo' src={logo} alt="Logo Pizza Block" />
            </div>

            <div className="footer_content-container">

                <div className="footer__social">
                    <a 
                    href="https://www.instagram.com/pizzablock.ar/" 
                    className="home__social-icon instagram" 
                    target="_blank"
                    >
                    <img src={instagramLogo} alt="logo de instagram" />
                    <p>@pizzablock.ar</p>
                    </a>

                    <a 
                    href="https://www.facebook.com/pizzablock.ar/" className="home__social-icon facebook" 
                    target="_blank"
                    >
                    <i className="uil uil-facebook"></i>
                    <p>@pizzablock.ar</p>
                    </a>

                    <a 
                    href="https://wa.me/541151772724" 
                    className="home__social-icon whatsapp" 
                    target="_blank"
                    >
                    <i className="uil uil-whatsapp-alt"></i>
                    <p>11-5177-2724</p>
                    </a>

                    <a 
                    href="tel:+5421995972" 
                    className="home__social-icon phone" 
                    target="_blank"
                    >
                    <i className="uil uil-phone"></i>
                    <p>2199-5972</p>
                    </a>

                </div>

            </div>

            <div className="footer__direccion-container">
                    <div className="footer_direc">
                        <h6>Dirección:</h6>
                        <p>Av Pedro Diaz 905 - Hurlingham</p>
                    </div>
                    <div className="banner_deli">
                    <img className='banner_delivery-img'src={delivery_image} alt="Banner de pizza block delivery" />
                    </div>
            </div>

        </div>

        <div className="copy_container">
            <div className="copy-text">
                <p>© Pizza Block 2025</p>
            </div>
        </div>
    </div>
  )
}

export default Footer