import {Controller} from '../components/Controller'
import '@/styles/herosection.css'

const HeroSection = () => {
  return (
    <div className='hero-section'>
        <div className='hero-background'></div>
        <div className='controller'>
        <Controller/>
        </div>
        <div className='title'>
            DYNA
        </div>
        <div className='caption'>
            DOMINATE YOUR NEXT ARENA
        </div>
    </div>
  )
}

export default HeroSection