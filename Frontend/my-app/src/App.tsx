import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import LoLPortfolio from './pages/LoLPortfolio'


function App() {
  return (
    <>
        <Router>
          <Navbar />
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/lol' element={<LoLPortfolio/>}/>
          </Routes>
        </Router>
    </>
  )
}

export default App
