import React, { useState, useEffect } from 'react'
import './Navbar.css'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'pizzas', label: 'Pizzas' },
    { id: 'empanadas', label: 'Empanadas' },
    { id: 'milanesas', label: 'Milanesas' },
    { id: 'promos', label: 'Promos' }
  ]

  useEffect(() => {
    const handleScroll = () => {
      // Efecto de scroll en navbar
      setScrolled(window.scrollY > 50)

      // Detectar sección activa
      const sections = menuItems.map(item => item.id)
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
    setIsOpen(false)
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <h1>Pizza Block</h1>
        </div>

        {/* Menu Desktop */}
        <ul className="navbar-menu desktop">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Botón Hamburguesa */}
        <button 
          className="hamburger"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Mobile */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <ul>
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={`mobile-link ${activeSection === item.id ? 'active' : ''}`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay para cerrar menu mobile */}
      {isOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </nav>
  )
}

export default Navbar