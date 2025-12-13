import React from 'react'
import '@/styles/footer.css'

const Footer = () => {
  return (
    <footer className='footer-container'>
      <div className='footer-content'>
        <div className='footer-left'>
           <h3 className='footer-heading'>CONTACT US</h3>
          <div className='social-icons'>
            <a href="mailto:yashnaik7664@gmail.com" className='social-link'>
              <img src='/mail-icon.png' alt='Email' />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className='social-link'>
              <img src='/git-icon.png' alt='GitHub' />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className='social-link'>
              <img src='/linkedin-icon.png' alt='LinkedIn' />
            </a>
          </div>
        </div>
        
        <div className='footer-center'>
          <h3 className='footer-heading'>QUICK LINKS</h3>
          <ul className='footer-links'>
            <li><a href="#hero-section">Home</a></li>
            <li><a href="#games">Games</a></li>
            <li><a href="#search">Players</a></li>
          </ul>
        </div>
        
        <div className='footer-right'>
         <div className='footer-logo'>
            <img src="/Dyna-Animation.gif" alt="DYNA Logo" className='footer-logo-img' />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
