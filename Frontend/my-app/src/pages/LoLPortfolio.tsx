import React, { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import ProductCarousel from "@/components/CarouselScroll";
import "@/styles/LoLPortfolio.css";
import RankAnimation from "@/components/RankAnimation";
import ScrollFadeIn from "@/components/ScrollFadeIn";

const roleIconMap: Record<string, string> = {
  top: "/images/league-user-stats/roleicon_top.png",
  jungle: "/images/league-user-stats/roleicon_jungle.png",
  middle: "/images/league-user-stats/roleicon_middle.png",
  mid: "/images/league-user-stats/roleicon_middle.png", // safety alias
  bottom: "/images/league-user-stats/Bottom_icon.png",
  adc: "/images/league-user-stats/roleicon_bottom.png", // optional
  support: "/images/league-user-stats/roleicon_support.png",
};

const rankIconMap: Record<string, string> = {
  unranked: "/images/league-user-stats/Crest_Unranked.png",
  iron: "/images/league-user-stats/Crest_Iron.png",
  bronze: "/images/league-user-stats/Crest_Bronze.png",
  silver: "/images/league-user-stats/Crest_Silver.png",
  gold: "/images/league-user-stats/Crest_Gold.png",
  platinum: "/images/league-user-stats/Crest_Platinum.png",
  diamond: "/images/league-user-stats/Crest_Diamond.png",
  master: "/images/league-user-stats/Crest_Master.png",
  grandmaster: "/images/league-user-stats/Crest_Grandmaster.png",
  challenger: "/images/league-user-stats/Crest_Challenger.png",
};

interface PlayerData {
  user_name: string;
  cur_rank: string;
  peak_rank: string;
  main_role: string;
  server: string;
  player_since: string;
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
        main_role: "Bottom",
        server: "SEA",
        player_since: "Season 10",
        cs_per_min: 6.5,
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

                    <div className="rank-center">
                      <div className="w-full max-w-[800px] aspect-square">
                        <RankAnimation rank={data!.cur_rank.split(" ")[0]} />
                      </div>
                    </div>
                    <div className="rank-side right-side w-64 text-right">
                        <p className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-white bg-clip-text text-transparent rank-right-fade">
                            {data!.cur_rank}
                        </p>
                    </div>
                </div>
              <div className="stats-section mt-12 px-6">
                  <h2 className="text-3xl font-bold mb-6 text-white">Summoner Overview</h2>
              </div>
              <div className="cards-section mt-12 px-6">
                <div className="cards-grid">
                  <div className="card fade-up" style={{ animationDelay: "0.4s" }}>
                    <h3 className="card-title">Last Season Rank</h3>
                    <img
                      src={
                        rankIconMap[data!.peak_rank.split(' ')[0].toLowerCase()]
                      }
                      alt={data!.peak_rank}
                      className="rank-icon"
                    />
                    <p className="card-content">{data!.peak_rank}</p>
                  </div>
                  <div className="card fade-up">
                    <h3 className="card-title">Server</h3>
                    <img
                      src="/images/league-user-stats/Server.png"
                      alt="Player Since"
                      className="server-icon"
                    />
                    <p className="card-content">{data!.server}</p>
                  </div>
                  <div className="card fade-up" style={{ animationDelay: "0.2s" }}>
                    <h3 className="card-title">Main Role</h3>
                    <img
                      src={
                        roleIconMap[data!.main_role.toLowerCase()]
                      }
                      alt={data!.main_role}
                      className="role-icon"
                    />
                    <p className="card-content">{data!.main_role}</p>
                  </div>
                  <div className="card fade-up">
                    <h3 className="card-title">Active Since</h3>
                    <img
                      src="/images/league-user-stats/Season_icon.png"
                      alt="Player Since"
                      className="season-icon"
                    />
                    <p className="card-content">{data!.player_since}</p>
                  </div>
                  <div className="card fade-up" style={{ animationDelay: "0.4s" }}>
                    <h3 className="card-title">Peak Rank</h3>
                    <img
                      src={
                        rankIconMap[data!.peak_rank.split(' ')[0].toLowerCase()]
                      }
                      alt={data!.peak_rank}
                      className="rank-icon"
                    />
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
