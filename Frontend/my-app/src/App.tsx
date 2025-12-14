import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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
            <Route path="/players/csgo" element={<CsgoPlayersPage />} />
            <Route
              path="/players/pubg/create"
              element={<CreatePubgPortfolioPage />}
            />
            <Route
              path="/players/csgo/create"
              element={<CreateCsgoPortfolioPage />}
            />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}
export default App;
