import React from 'react'
import { useNavigate } from 'react-router-dom'
import Gamecard from './ui/gamecard'
import '@/styles/games.css'

const Games = () => {
  const navigate = useNavigate();
  
  const games = [
    {
      title: 'PUBG',
      image: '/pubgcard.png',
      route: '/players/pubg'
    },
    {
      title: 'VALORANT',
      image: '/valocard.png',
      route: '/players/valorant'
    },
    {
        title: 'CSGO',
        image: '/csgocard.png',
        route: '/players/csgo'
    },
    {
        title: 'LEAGUE OF LEGENDS',
        image: '/lolcard.png',
        route: '/players/lol'
    }
  ];

  const handleGameClick = (route: string) => {
    navigate(route);
  };

  return (
    <div id='games' className='games-section'>
      <h2 className='games-heading'>FEATURED GAMES</h2>
      <div className='games-grid'>
        {games.map((game, index) => (
          <div key={index} onClick={() => handleGameClick(game.route)} style={{ cursor: 'pointer' }}>
            <Gamecard 
              title={game.title}
              image={game.image}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Games