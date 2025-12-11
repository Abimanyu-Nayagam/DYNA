import React from 'react'
import Gamecard from './ui/gamecard'
import '@/styles/games.css'

const Games = () => {
  const games = [
    {
      title: 'PUBG',
      image: '/pubgcard.png'
    },
    {
      title: 'VALORANT',
      image: '/valocard.png'
    }
    ,
    {
        title: 'CSGO',
        image: '/csgocard.png'
    },
    {
        title: 'LEAGUE OF LEGENDS',
        image: '/lolcard.png'
    }
  ];

  return (
    <div id='games' className='games-section'>
      <h2 className='games-heading'>FEATURED GAMES</h2>
      <div className='games-grid'>
        {games.map((game, index) => (
          <Gamecard 
            key={index}
            title={game.title}
            image={game.image}
          />
        ))}
      </div>
    </div>
  )
}

export default Games