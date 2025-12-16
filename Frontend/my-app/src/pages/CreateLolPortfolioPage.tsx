import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { leagueAPI } from "@/services/api";
import "@/styles/CreateLolPortfolio.css";

interface LeagueFormData {
  ign: string;
  riot_id: string;
  server: string;

  cur_rank: string;
  peak_rank: string;
  last_season_rank: string;
  main_role: string;

  cs_per_min: number | string;
  avg_kills: number | string;
  avg_deaths: number | string;
  avg_assists: number | string;

  avg_dmg: number | string;
  avg_vision_score: number | string;
  avg_game_duration: number | string;
}

const CreateLolPortfolioPage = () => {
  const navigate = useNavigate();
  const { user, token, loading } = useAuth();

  const [formData, setFormData] = useState<LeagueFormData>({
    ign: "",
    riot_id: "",
    server: "EUW",

    cur_rank: "Bronze",
    peak_rank: "Bronze",
    last_season_rank: "Bronze",
    main_role: "Mid",

    cs_per_min: "",
    avg_kills: "",
    avg_deaths: "",
    avg_assists: "",

    avg_dmg: "",
    avg_vision_score: "",
    avg_game_duration: "",
  });

  const [isUpdate, setIsUpdate] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);

    const checkExistingPortfolio = async () => {
    try {
      const existing = await leagueAPI.getStatsByUser();
      if (!existing) return;

      setFormData({
        ign: existing.ign || "",
        riot_id: existing.riot_id || "",
        server: existing.server || "EUW",

        cur_rank: existing.cur_rank || "Bronze",
        peak_rank: existing.peak_rank || "Bronze",
        last_season_rank: existing.last_season_rank || "Bronze",
        main_role: existing.main_role || "Mid",

        cs_per_min: existing.cs_per_min?.toString() || "",
        avg_kills: existing.avg_kills?.toString() || "",
        avg_deaths: existing.avg_deaths?.toString() || "",
        avg_assists: existing.avg_assists?.toString() || "",

        avg_dmg: existing.avg_dmg?.toString() || "",
        avg_vision_score: existing.avg_vision_score?.toString() || "",
        avg_game_duration: existing.avg_game_duration?.toString() || "",
      });

      setExistingId(existing.id);
      setIsUpdate(true);
    } catch {}
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }
    if (!loading && user?.user_id) checkExistingPortfolio();
  }, [user, loading]);

  const ranks = [
    "Iron","Bronze","Silver","Gold","Platinum",
    "Emerald","Diamond","Master","Grandmaster","Challenger",
  ];

  const roles = ["Top", "Jungle", "Mid", "Bottom", "Support"];
  const servers = ["NA", "EUW", "EUNE", "OCE", "RU", "TR", "BR", "LAN", "LAS", "JP", "TW", "SEA", "TH", "VN", "KR", "CN", "MENA"];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;

    const payload = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [
        k,
        v === "" ? null : Number.isNaN(Number(v)) ? v : Number(v),
      ])
    );

    const res = await fetch("http://localhost:5000/api/lol/create-folio", {
      method: isUpdate ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to save portfolio");
    navigate("/players/lol");
  };


  if (loading) return null;
  if (!user) return null;

  return (
    <div className="lol-create-page">
      <div className="lol-container">
        <h2 className="lol-title">
          {isUpdate ? "Update LoL Portfolio" : "Create LoL Portfolio"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Player Info */}
          <h3 className="lol-section-title">Player Info</h3>
          <div className="lol-grid">
            <div className="lol-field">
              <label>IGN</label>
              <input name="ign" value={formData.ign} onChange={handleChange} />
            </div>

            <div className="lol-field">
              <label>Riot ID (#TAG)</label>
              <input name="riot_id" value={formData.riot_id} onChange={handleChange} />
            </div>

            <div className="lol-field">
              <label>Server</label>
              <select name="server" value={formData.server} onChange={handleChange}>
                {servers.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Ranks */}
          <h3 className="lol-section-title">Ranks</h3>
          <div className="lol-grid">
            <div className="lol-field">
              <label>Current Rank</label>
              <select name="cur_rank" value={formData.cur_rank} onChange={handleChange}>
                {ranks.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div className="lol-field">
              <label>Peak Rank</label>
              <select name="peak_rank" value={formData.peak_rank} onChange={handleChange}>
                {ranks.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div className="lol-field">
              <label>Last Season</label>
              <select name="last_season_rank" value={formData.last_season_rank} onChange={handleChange}>
                {ranks.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div className="lol-field">
              <label>Main Role</label>
              <select name="main_role" value={formData.main_role} onChange={handleChange}>
                {roles.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Stats */}
          <h3 className="lol-section-title">Stats</h3>
          <div className="lol-grid">
            <div className="lol-field"><label>CS / Min</label><input name="cs_per_min" onChange={handleChange} value={formData.cs_per_min} /></div>
            <div className="lol-field"><label>Avg Kills</label><input name="avg_kills" onChange={handleChange} value={formData.avg_kills} /></div>
            <div className="lol-field"><label>Avg Deaths</label><input name="avg_deaths" onChange={handleChange} value={formData.avg_deaths} /></div>
            <div className="lol-field"><label>Avg Assists</label><input name="avg_assists" onChange={handleChange} value={formData.avg_assists} /></div>
            <div className="lol-field"><label>Avg Damage</label><input name="avg_dmg" onChange={handleChange} value={formData.avg_dmg} /></div>
            <div className="lol-field"><label>Vision Score</label><input name="avg_vision_score" onChange={handleChange} value={formData.avg_vision_score} /></div>
            <div className="lol-field"><label>Game Duration (min)</label><input name="avg_game_duration" onChange={handleChange} value={formData.avg_game_duration} /></div>
          </div>

          <button className="lol-submit-btn" type="submit">
            {isUpdate ? "Update Portfolio" : "Create Portfolio"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateLolPortfolioPage;
