import HeroSection from '@/components/HeroSection'
import Games from '@/components/Games'
import React from 'react'
import Footer from '@/components/Footer'

const Home = () => {
  return (
    <div id='home'>
    <HeroSection/>
    <Games/>
    <Footer/>
    </div>
  )
}

export default Home