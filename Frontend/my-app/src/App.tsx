import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { Signup } from "./pages/SignUp";
import { Login } from "./pages/Login";
import { AuthProvider } from "./contexts/AuthProvider";
import PubgPlayersPage from "./pages/PubgPlayersPage";
import CreatePubgPortfolioPage from "./pages/CreatePubgPortfolioPage";
import CsgoPlayersPage from "./pages/CsgoPlayersPage";
import CreateCsgoPortfolioPage from "./pages/CreateCsgoPortfolioPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PubgPortfolio from "./pages/PubgPortfolio";
import AllUsersPage from "./pages/AllUsersPage";
import MainPortfolio from "./pages/MainPortfolio";
import LoLPortfolio from "./pages/LoLPortfolio";
import CsgoPortfolio from "./pages/CsgoPortfolio";
import Profile from "./pages/ProfilePage";
import ValorantSearchPage from './pages/valorant pages/ValorantSearchPage';
import ValorantProfilePage from './pages/valorant pages/ValorantProfilePage';
import CreateValorantPortfolioPage from "./pages/valorant pages/CreateValorantPortfolioPage";
import CreateLolPortfolioPage from "./pages/CreateLolPortfolioPage";
import LolPlayersPage from "./pages/LolPlayersPage";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/players/pubg" element={<PubgPlayersPage />} />
           <Route path="/players/:username" element={<MainPortfolio />} />
            <Route path="/players/:username/pubg" element={<PubgPortfolio />} />
            <Route path="/players/:username/csgo" element={<CsgoPortfolio />} />
            <Route
              path="/players/:username/valo"
              element={<div>VALORANT Portfolio Coming Soon</div>}
            />
            <Route
              path="/players/:username/lol"
              element={ <LoLPortfolio />}
            />
            <Route path="/players/csgo" element={<CsgoPlayersPage />} />
            <Route path="/players/valorant" element={<ValorantSearchPage />} />
            <Route path="/players/valorant/me" element={<ValorantProfilePage />} />
            <Route path="/players/valorant/:username" element={<ValorantProfilePage />} />
            <Route path="/players/valorant/create" element={<CreateValorantPortfolioPage />} />
            <Route path="/players/lol" element={<LolPlayersPage />} />
            <Route
              path="/players/pubg/create"
              element={<CreatePubgPortfolioPage />}
            />
            <Route path="/players/lol/create" element={<CreateLolPortfolioPage />} />
            <Route path="/players" element={<AllUsersPage />} />
            <Route
              path="/players/csgo/create"
              element={<CreateCsgoPortfolioPage />}
            />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}
export default App;
