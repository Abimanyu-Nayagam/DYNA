import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/Navbar.css'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', section: 'hero-section'},
    { name: 'Games', section: 'games'},
    { name: '🔎︎ Players', section: 'search'},
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = (section: string) => {
    closeMenu();
    
    // If not on home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation then scroll
      setTimeout(() => {
        scrollToSection(section);
      }, 100);
    } else {
      // Already on home page, just scroll
      scrollToSection(section);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogoClick = () => {
    navigate('/');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <> 
    <nav className="navbar" id="navbar">
      <div className="logo" onClick={handleLogoClick}>
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
            <a onClick={() => handleNavClick(link.section)}>
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