import React from 'react'
import { useParams, Link } from 'react-router-dom'
import '../styles/mainportfolio.css'

const MainPortfolio = () => {
  const { userId } = useParams<{ userId: string }>();

  return (
    <div className="main-portfolio">
      <Link to="/players" className="back-link">← Back to Players</Link>

      <div className="portfolio-header">
        <h1 className="portfolio-title">Player Portfolio</h1>
        <p className="portfolio-subtitle">User ID: {userId}</p>
      </div>

      <div className="main-portfolio-games-grid">
        <div className="main-portfolio-game-card">
          <span className="main-portfolio-game-icon">🎮</span>
          <h2 className="main-portfolio-game-title">PUBG</h2>
          <Link to={`/players/${userId}/pubg`} className="main-portfolio-game-link">
            View Portfolio
          </Link>
        </div>

        <div className="main-portfolio-game-card">
          <span className="main-portfolio-game-icon">🔫</span>
          <h2 className="main-portfolio-game-title">CSGO</h2>
          <Link to={`/players/${userId}/csgo`} className="main-portfolio-game-link">
            View Portfolio
          </Link>
        </div>

        <div className="main-portfolio-game-card">
          <span className="main-portfolio-game-icon">⚔️</span>
          <h2 className="main-portfolio-game-title">VALORANT</h2>
          <Link to={`/players/${userId}/valo`} className="main-portfolio-game-link">
            View Portfolio
          </Link>
        </div>

        <div className="main-portfolio-game-card">
          <span className="main-portfolio-game-icon">🏆</span>
          <h2 className="main-portfolio-game-title">LOL</h2>
          <Link to={`/players/${userId}/lol`} className="main-portfolio-game-link">
            View Portfolio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MainPortfolio