import React from 'react'
import {Controller} from '../components/Controller'
import '@/styles/HeroSection.css'

const HeroSection = () => {
  return (
    <div><div className='hero-section'>
        <div className='controller'>
        <Controller/>
        </div>
        <div className='title'>
            DYNA
        </div>
        <div className='caption'>
            Dominate Your Arena
        </div>
    </div></div>
  )
}

export default HeroSection