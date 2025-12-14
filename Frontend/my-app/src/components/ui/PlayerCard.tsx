import React from 'react'
import '@/styles/playercard.css'

interface PlayerCardProps {
  username: string;
  in_game_id: string;
  current_rank: string;
  user_id: number;
  onClick?: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  username, 
  in_game_id, 
  current_rank,
  onClick
}) => {
  return (
    <div className="player-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="player-card-header">
        <div className="player-avatar">
          {username.charAt(0).toUpperCase()}
        </div>
        <div className="player-info">
          <h3 className="player-username">{username}</h3>
          <p className="player-game-id">{in_game_id} | {current_rank}</p>
        </div>
      </div> 
    </div>
  )
}

export default PlayerCard
