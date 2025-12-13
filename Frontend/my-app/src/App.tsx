import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import PubgPlayersPage from './pages/PubgPlayersPage'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/players/pubg' element={<PubgPlayersPage/>}/>
      </Routes>
    </Router>
  )
}

export default App
