import React from 'react'
import '@/styles/playercard.css'

interface UserCardProps {
  username: string;
  user_id: number;
  onClick?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ 
  username, 
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
        </div>
      </div> 
    </div>
  )
}

export default UserCard
