import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import PubgPlayersPage from './pages/PubgPlayersPage'
import CreatePubgPortfolioPage from './pages/CreatePubgPortfolioPage'
import PubgPortfolio from './pages/PubgPortfolio'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/players/pubg' element={<PubgPlayersPage/>}/>
        <Route path='/players/pubg/create' element={<CreatePubgPortfolioPage/>}/>
        <Route path='/players/:userId' element={<PubgPortfolio/>}/>
      </Routes>
    </Router>
  )
}

export default App
