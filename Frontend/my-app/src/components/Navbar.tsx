import { useState } from 'react'
import '../styles/Navbar.css'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home'},
    { name: 'Games', href: '#games'},
    { name: '🔎︎ Players', href: '#search'},
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <> 
    <nav className="navbar" id="navbar">
      <div className="logo">
        <img src="/DYNA.png" alt="DYNA Logo" className="logo-img" />
        <span className="logo-text">DYNA</span>
      </div>

      {/* Hamburger Menu */}
      <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        {navLinks.map((link) => (
          <li key={link.name}>
            <a href={link.href} onClick={closeMenu}>
              {link.name}
            </a>
          </li>
        ))}
      </ul>

      <div className={`Nav-btns ${isMenuOpen ? 'active' : ''}`}>
        <button className="btn" onClick={closeMenu}>LOGIN</button>
        <button className="btn" onClick={closeMenu}>REGISTER</button>
      </div>
    </nav>
    </>
  )
}

export default Navbar