import React, { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import ProductCarousel from "@/components/CarouselScroll";
import "@/styles/LoLPortfolio.css";
import RankAnimation from "@/components/RankAnimation";


interface PlayerData {
  user_name: string;
  cur_rank: string;
  peak_rank: string;
  main_role: string;
  cs_per_min: number;
  avg_dmg: number;
  avg_kda: number;
  avg_kp_percent: number;
  avg_vision_score: number;
}

const LoLPortfolio: React.FC = () => {
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      const json: PlayerData = {
        user_name: "42Raven42",
        cur_rank: "Gold 2",
        peak_rank: "Platinum 4",
        main_role: "Mid",
        cs_per_min: 7.5,
        avg_dmg: 25000,
        avg_kda: 3.5,
        avg_kp_percent: 65.0,
        avg_vision_score: 18,
      };

      setData(json);
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <div id="LoLPortfolio" className="lol-wrapper">
      <main className="lol-content">
        {loading ? (
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full spinner-fade"></div>
        ) : (
            <div className="rank-layout-wrapper">
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-white bg-clip-text text-transparent header-fade">
                    {data!.user_name}'s Summoner Stats
                </h1>

                <div className="rank-layout">
                    
                    <div className="rank-side left-side w-64">
                        <p className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-white bg-clip-text text-transparent rank-left-fade">
                            Current Rank
                        </p>
                    </div>

                    <div className="rank-center flex-1 flex justify-center">
                        <RankAnimation rank={data!.cur_rank.split(" ")[0]} />
                    </div>

                    <div className="rank-side right-side w-64 text-right">
                        <p className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-white bg-clip-text text-transparent rank-right-fade">
                            {data!.cur_rank}
                        </p>
                    </div>
                </div>
                <div className="stats-section mt-12 px-6">
                    <h2 className="text-3xl font-bold mb-6 text-white">Performance Stats</h2>
                </div>
                <div className="cards-section mt-12 px-6">
                <h2 className="text-3xl font-bold mb-6 text-white fade-up">Highlights</h2>
                <div className="cards-grid">
                  <div className="card fade-up">
                    <h3 className="card-title"></h3>
                    <p className="card-content">Zed, 56% win rate</p>
                  </div>
                  <div className="card fade-up" style={{ animationDelay: "0.2s" }}>
                    <h3 className="card-title">Main Role</h3>
                    <p className="card-content">{data!.main_role}</p>
                  </div>
                  <div className="card fade-up" style={{ animationDelay: "0.4s" }}>
                    <h3 className="card-title">Peak Rank</h3>
                    <p className="card-content">{data!.peak_rank}</p>
                  </div>
                </div>
              </div>

            </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LoLPortfolio;
