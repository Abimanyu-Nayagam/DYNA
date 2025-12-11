import React from 'react'
import '../styles/Navbar.css'

const Navbar = () => {

    const navLinks = [
    { name: 'Home', href: '#home'},
    { name: 'Games', href: '#games'},
    { name: '🔎︎ Players', href: '#search'},
  ];
  return (
    <> 
    <nav className="navbar" id="navbar">
      <div className="logo">DYNA</div>
      <ul className="nav-links">
        {navLinks.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
      <div className='Nav-btns'>
      <button className="btn">LOGIN</button>
      <button className="btn">REGISTER</button>
      </div>
      </nav>
    </>
  )
}

export default Navbar