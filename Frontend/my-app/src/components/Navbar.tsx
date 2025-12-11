import React from "react";
import "../styles/Navbar.css";
import { Link } from "react-router-dom";
const Navbar = () => {
  const navLinks = [
    { name: "Home", href: "#home", hasDropdown: false },
    { name: "Games", href: "#games", hasDropdown: true },
    { name: "🔎︎ Players", href: "#search", hasDropdown: false },
  ];
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(
    null
  );
  return (
    <>
      <nav className="navbar">
        <div className="logo">DYNA</div>
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                onMouseEnter={() =>
                  link.hasDropdown && setActiveDropdown(link.name)
                }
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
        <Link to="/login" className="btn">
          LOGIN
        </Link>
        <Link to="/signup" className="btn">
          REGISTER
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
