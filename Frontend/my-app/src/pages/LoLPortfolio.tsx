import React, { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import VideoCarousel from "@/components/CarouselScroll";
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

const highlightVideos: string[] = [
  "/videos/highlights/Download.mp4",
  "/videos/highlights/Flash_Surprise_-_Made_with_Clipchamp.mp4",
  "/videos/highlights/Messenger_creation_1185985633102759.mp4",
  "/videos/highlights/vijc90w.mp4"
  // add/remove freely
];


interface PlayerData {
  user_name: string;
  cur_rank: string;
  peak_rank: string;
  last_season_rank: string;
  main_role: string;
  server: string;
  player_since: string;
  cs_per_min: number;
  avg_total_dmg: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  avg_
  avg_game_duration: number;
  avg_vision_score: number;
}

const LoLPortfolio: React.FC = () => {
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      const json: PlayerData = {
        user_name: "42Raven42",
        cur_rank: "Challenger",
        peak_rank: "Challenger 4",
        last_season_rank: "Grandmaster 1",
        main_role: "Support",
        server: "SEA",
        player_since: "Season 10",
        cs_per_min: 6.5,
        avg_total_dmg: 25000,
        avg_kills: 8,
        avg_deaths: 5,
        avg_assists: 10,
        avg_game_duration: 35,
        avg_vision_score: 18,
      };

      // Calculate avg kda, combat participation(avg (K + A)), avg dmg per min, avg vision score per min, assist ratio (A / (K + A))
      json["avg_kda"] = parseFloat(((json.avg_kills + json.avg_assists) / Math.max(1, json.avg_deaths)).toFixed(2));
      json["avg_dmg_per_min"] = parseFloat((json.avg_total_dmg / json.avg_game_duration).toFixed(2));
      json["avg_vision_score_per_min"] = parseFloat((json.avg_vision_score / json.avg_game_duration).toFixed(2));
      json["avg_assist_ratio"] = parseFloat((json.avg_assists / Math.max(1, (json.avg_kills + json.avg_assists))).toFixed(2));
      json["combat_participation_per_min"] = parseFloat(((json.avg_kills + json.avg_assists) / json.avg_game_duration).toFixed(2));

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
                        rankIconMap[data!.last_season_rank.split(' ')[0].toLowerCase()]
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
              {/* ===== GENERAL STATS ===== */}
              <div className="general-stats">
                {/* Avg KDA */}
                <div className="general-stat">
                  <h2>Average KDA</h2>
                  <p>{data!.avg_kda}</p>
                </div>

                {/* Combat Participation or Assist Ratio */}
                <div className="general-stat">
                  <h2>{data!.main_role.toLowerCase() === "support" ? "Assist Ratio" : "Combat Participation"}</h2>
                  <p>{data!.main_role.toLowerCase() === "support" ? data!.avg_assist_ratio : data!.combat_participation_per_min}</p>
                </div>
              </div>

              {/* ===== ROLE SPECIFIC STATS ===== */}
              <div className="role-stats">
                {data!.main_role.toLowerCase() !== "support" ? (
                  <>
                    {/* CS / Min */}
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

                    {/* DMG / Min */}
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
                  </>
                ) : (
                  <>
                    {/* Vision Score / Min */}
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

                    {/* Assist Ratio */}
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
                <h2 className="text-3xl font-bold mb-6 text-white">Full Stats</h2>

                <div className="full-stats-grid grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Each stat as a card */}
                  <div className="stat-card">
                    <p className="stat-name">Average KDA</p>
                    <p className="stat-value">{data!.avg_kda}</p>
                  </div>

                  <div className="stat-card">
                    <p className="stat-name">Average Combat Participation / Min</p>
                    <p className="stat-value">{data!.combat_participation_per_min}</p>
                  </div>

                  <div className="stat-card">
                    <p className="stat-name">Average Assist Ratio</p>
                    <p className="stat-value">{data!.avg_assist_ratio}</p>
                  </div>

                  <div className="stat-card">
                    <p className="stat-name">CS / Min</p>
                    <p className="stat-value">{data!.cs_per_min}</p>
                  </div>

                  <div className="stat-card">
                    <p className="stat-name">Average Damage / Min</p>
                    <p className="stat-value">{data!.avg_dmg_per_min}</p>
                  </div>

                  <div className="stat-card">
                    <p className="stat-name">Average Vision Score / Min</p>
                    <p className="stat-value">{data!.avg_vision_score_per_min}</p>
                  </div>

                  <div className="stat-card">
                    <p className="stat-name">Average Game Duration</p>
                    <p className="stat-value">{data!.avg_game_duration} min</p>
                  </div>

                  <div className="stat-card">
                    <p className="stat-name">Average Kills</p>
                    <p className="stat-value">{data!.avg_kills}</p>
                  </div>

                  <div className="stat-card">
                    <p className="stat-name">Average Deaths</p>
                    <p className="stat-value">{data!.avg_deaths}</p>
                  </div>

                  <div className="stat-card">
                    <p className="stat-name">Average Assists</p>
                    <p className="stat-value">{data!.avg_assists}</p>
                  </div>

                  <div className="stat-card">
                    <p className="stat-name">Average Total Damage</p>
                    <p className="stat-value">{data!.avg_total_dmg}</p>
                  </div>
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
