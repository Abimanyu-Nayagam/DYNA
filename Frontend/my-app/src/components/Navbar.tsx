import React from 'react'
import '../styles/Navbar.css'

const Navbar = () => {

    const navLinks = [
    { name: 'Home', href: '#home', hasDropdown: false },
    { name: 'Games', href: '#games', hasDropdown: true },
    { name: '🔎︎ Players', href: '#search', hasDropdown: false },
  ];
    const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  return (
    <> 
    <nav className="navbar">
      <div className="logo">DYNA</div>
      <ul className="nav-links">
        {navLinks.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.name)}
              onMouseLeave={() => setActiveDropdown(null)}
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