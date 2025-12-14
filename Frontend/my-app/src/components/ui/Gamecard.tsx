import React from 'react'
import '@/styles/gamecard.css'

interface GamecardProps {
  title: string;
  image: string;
}

const Gamecard: React.FC<GamecardProps> = ({ title, image }) => {
  return (
    <div className='game-card'>
      <div className='game-card-image' style={{ backgroundImage: `url(${image})` }}></div>
      <div className='game-card-overlay'></div>
      <div className='game-card-content'>
        <h2 className='game-card-title'>{title}</h2>
      </div>
    </div>
  )
}

export default Gamecard