import './Navbar.css'
import logo from '../assets/logo.png';
import React, { useEffect, useState } from 'react';


function Navbar() {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isTop = window.scrollY < 100;
      setIsSticky(!isTop);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div>
        <div className="header">
            <div className="logo-container">
                 <img src={logo} alt="Logo Pizza Block" />
            </div>
          <div className="navbar">
            <nav className={isSticky ? 'navbar_nav sticky' : 'navbar_nav'}>
              <ul>
                <li><a href="#pizzas">Pizzas</a></li>
                <div className='linea'>|</div>
                <li><a href="#empanadas">Empanadas</a></li>
                <div className='linea'>|</div>
                <li><a href="#milanesas">Milanesas</a></li>
              </ul>
            </nav>
          </div>
        </div>
    </div>
  )
}

export default Navbar