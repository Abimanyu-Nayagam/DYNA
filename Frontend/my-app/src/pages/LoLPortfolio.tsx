import React, { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import VideoCarousel from "@/components/CarouselScroll";
import "@/styles/LoLPortfolio.css";
import RankAnimation from "@/components/RankAnimation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { leagueAPI } from "@/services/api";

const roleIconMap: Record<string, string> = {
  top: "/images/league-user-stats/roleicon_top.png",
  jungle: "/images/league-user-stats/roleicon_jungle.png",
  middle: "/images/league-user-stats/roleicon_middle.png",
  bottom: "/images/league-user-stats/Bottom_icon.png",
  support: "/images/league-user-stats/Support_icon.png",
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

const highlightVideos: string[] = [
  "/videos/highlights/Download.mp4",
  "/videos/highlights/Flash_Surprise_-_Made_with_Clipchamp.mp4",
  "/videos/highlights/Messenger_creation_1185985633102759.mp4",
  "/videos/highlights/vijc90w.mp4"
  // add/remove freely
];


interface PlayerData {
  ign: string;
  cur_rank: string;
  peak_rank: string;
  last_season_rank: string;
  main_role: string;
  server: string;
  player_since: string;
  cs_per_min: number;
  avg_dmg: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  avg_game_duration: number;
  avg_vision_score: number;
}

const LoLPortfolio: React.FC = () => {
  // Define useparams to get username from URL if needed
  

  // State for player data and loading status
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const apiData = await leagueAPI.getStatsByUser();

        const derivedData = {
          ...apiData,

          avg_kda: Number(
            ((apiData.avg_kills + apiData.avg_assists) /
              Math.max(1, apiData.avg_deaths)).toFixed(2)
          ),

          avg_dmg_per_min: Number(
            (apiData.avg_dmg / apiData.avg_game_duration).toFixed(2)
          ),

          avg_vision_score_per_min: Number(
            (apiData.avg_vision_score / apiData.avg_game_duration).toFixed(2)
          ),

          avg_assist_ratio: Number(
            (apiData.avg_assists /
              Math.max(1, apiData.avg_kills + apiData.avg_assists)).toFixed(2)
          ),

          combat_participation_per_min: Number(
            ((apiData.avg_kills + apiData.avg_assists) /
              apiData.avg_game_duration).toFixed(2)
          ),
        };

        setData(derivedData);
      } catch (error) {
        console.error("Error fetching LoL player data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  return (
    <div id="LoLPortfolio" className="lol-wrapper">
      <main className="lol-content">
        {loading ? (
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full spinner-fade"></div>
        ) : (
            <div className="rank-layout-wrapper">
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-white bg-clip-text text-transparent header-fade">
                    {data!.ign}'s Summoner Stats
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
                        rankIconMap[data!.last_season_rank.split(' ')[0].toLowerCase()]
                      }
                      alt={data!.last_season_rank}
                      className="rank-icon"
                    />
                    <p className="card-content">{data!.last_season_rank}</p>
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
              {/* ===== GENERAL STATS ===== */}
              {/* ===== COMMON STATS (FULL WIDTH) ===== */}
              <section className="stat-sections">

                {/* Average KDA */}
                <div className="stat-section">
                  <ScrollFadeIn>
                    <div className="stat-text">
                      <h2>Average KDA</h2>
                      <p className="stat-value">{data!.avg_kda}</p>
                      <p className="stat-desc">
                        Overall combat efficiency across your recent games
                      </p>
                    </div>
                    <div className="stat-media">
                      <img
                        src="/images/league-user-stats/kda_image.png"
                        alt="Average KDA"
                      />
                    </div>
                  </ScrollFadeIn>
                </div>

                {/* Combat Participation */}
                <div className="stat-section reverse">
                  <ScrollFadeIn>
                  <div className="stat-text">
                    <h2>Combat Participation / Min</h2>
                    <p className="stat-value">{data!.combat_participation_per_min}</p>
                    <p className="stat-desc">
                      How often you contribute to fights every minute
                    </p>
                  </div>
                  
                  <div className="stat-media">
                    <img
                      src="/images/league-user-stats/combat_image.png"
                      alt="Combat Participation"
                    />
                  </div>
                  </ScrollFadeIn>
                </div>

              </section>


              {/* ===== ROLE SPECIFIC STATS ===== */}
              <div className="role-stats">
                {data!.main_role.toLowerCase() !== "support" ? (
                  <>
                    {/* CS / Min */}
                    <ScrollFadeIn>
                      <div className="role-stat">
                      <div className="stat-info">
                        <h2>CS per Minute</h2>
                        <p>{data!.cs_per_min}</p>
                        <p>Tracks your farming efficiency</p>
                      </div>
                      <div className="stat-media">
                        <img src="/images/league-user-stats/cs_image.png" alt="CS" />
                      </div>
                    </div>
                    </ScrollFadeIn>

                    {/* DMG / Min */}
                    <ScrollFadeIn>
                      <div className="role-stat flex-row-reverse">
                      <div className="stat-info">
                        <h2>Damage per Minute</h2>
                        <p>{data!.avg_dmg_per_min}</p>
                        <p>How much damage you deal every minute</p>
                      </div>
                      <div className="stat-media">
                        <img src="/images/league-user-stats/dmg_image.png" alt="Damage" />
                      </div>
                    </div>
                    </ScrollFadeIn>
                  </>
                ) : (
                  <>
                    {/* Vision Score / Min */}
                    <ScrollFadeIn>
                      <div className="role-stat">
                      <div className="stat-info">
                        <h2>Vision Score per Minute</h2>
                        <p>{data!.avg_vision_score_per_min}</p>
                        <p>Tracks how much you help your team with vision</p>
                      </div>
                      <div className="stat-media">
                        <img src="/images/league-user-stats/vision_image.png" alt="Vision" />
                      </div>
                    </div>
                    </ScrollFadeIn>

                    {/* Assist Ratio */}
                    <ScrollFadeIn>
                      <div className="role-stat flex-row-reverse">
                      <div className="stat-info">
                        <h2>Assist Ratio</h2>
                        <p>{data!.avg_assist_ratio}</p>
                        <p>Percentage of kills you assisted in</p>
                      </div>
                      <div className="stat-media">
                        <img src="/images/league-user-stats/assist_image.png" alt="Assist" />
                      </div>
                    </div>
                    </ScrollFadeIn>

                  </>
                )}
              </div>
                {highlightVideos.length > 0 && (
                  <section className="mt-16 w-full px-6">
                    <h2 className="text-3xl font-bold mb-6 text-white">
                      Highlights
                    </h2>
                    <ScrollFadeIn>
                      <VideoCarousel videos={highlightVideos} />
                    </ScrollFadeIn>
                  </section>
                )}
              <section className="full-stats-section mt-16 px-6">
                  <div className="stats-section mt-12 px-6">
                    <h2 className="text-3xl font-bold mb-6 text-white">Full Stat Breakdown</h2>
                  </div>
                  <div className="full-stats-grid">
                    {/* Left column: base stats */}
                    <table className="full-stats-table">
                      <tbody>
                        <tr><td>Average Kills</td><td>{data!.avg_kills}</td></tr>
                        <tr><td>Average Deaths</td><td>{data!.avg_deaths}</td></tr>
                        <tr><td>Average Assists</td><td>{data!.avg_assists}</td></tr>
                        <tr><td>Average Total Damage</td><td>{data!.avg_dmg}</td></tr>
                        <tr><td>Average Game Duration</td><td>{data!.avg_game_duration} min</td></tr>
                        <tr><td>CS / Min</td><td>{data!.cs_per_min}</td></tr>
                      </tbody>
                    </table>

                    {/* Right column: calculated stats */}
                    <table className="full-stats-table">
                      <tbody>
                        <tr><td>Average KDA</td><td>{data!.avg_kda}</td></tr>
                        <tr><td>Average Combat Participation / Min</td><td>{data!.combat_participation_per_min}</td></tr>
                        <tr><td>Average Assist Ratio</td><td>{data!.avg_assist_ratio}</td></tr>
                        <tr><td>Average Damage / Min</td><td>{data!.avg_dmg_per_min}</td></tr>
                        <tr><td>Average Vision Score / Min</td><td>{data!.avg_vision_score_per_min}</td></tr>
                      </tbody>
                    </table>
                  </div>
              </section>
            </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LoLPortfolio;
