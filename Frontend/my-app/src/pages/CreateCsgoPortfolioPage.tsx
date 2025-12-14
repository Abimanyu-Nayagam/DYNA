import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { csgoAPI } from "@/services/api";
import "@/styles/createportfolio.css";

interface CsgoFormData {
  username: string;
  in_game_id: string;
  current_rank: string;
  highest_rank: string;
  mm_rank: string;
  faceit_level: number | string;
  elo: number | string;
  kd_ratio: number | string;
  headshot_percentage: number | string;
  kills: number | string;
  deaths: number | string;
  assists: number | string;
  mvps: number | string;
  matches_played: number | string;
  wins: number | string;
  win_rate: number | string;
  avg_damage_per_round: number | string;
  avg_kills_per_round: number | string;
  rounds_played: number | string;
  bomb_plants: number | string;
  bomb_defuses: number | string;
  flash_assists: number | string;
}

type FieldConfig = {
  name: keyof CsgoFormData;
  label: string;
  type: "text" | "number" | "select";
  required?: boolean;
  placeholder?: string;
  step?: string;
  options?: string[];
};

type FormInputProps = {
  field: FieldConfig;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
};

export const FormInput = ({ field, value, onChange }: FormInputProps) => (
  <div className="form-group">
    <label htmlFor={field.name}>{field.label}</label>

    {field.type === "select" ? (
      <select
        id={field.name}
        name={field.name}
        value={value}
        required={field.required}
        onChange={onChange}
      >
        {field.options!.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    ) : (
      <input
        id={field.name}
        name={field.name}
        type={field.type}
        step={field.step}
        required={field.required}
        value={value}
        onChange={onChange}
      />
    )}
  </div>
);

const CreateCsgoPortfolioPage = () => {
  const navigate = useNavigate();
  const { user, token, loading } = useAuth();
  const [formData, setFormData] = useState<CsgoFormData>({
    username: "",
    in_game_id: "",
    current_rank: "Silver I",
    highest_rank: "Silver I",
    mm_rank: "Silver I",
    faceit_level: "",
    elo: "",
    kd_ratio: "",
    headshot_percentage: "",
    kills: "",
    deaths: "",
    assists: "",
    mvps: "",
    matches_played: "",
    wins: "",
    win_rate: "",
    avg_damage_per_round: "",
    avg_kills_per_round: "",
    rounds_played: "",
    bomb_plants: "",
    bomb_defuses: "",
    flash_assists: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [existingStatsId, setExistingStatsId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      alert("Please login to create a portfolio");
      navigate("/login");
      return;
    }

    // Check if user already has a portfolio
    if (!loading && user && user.user_id) {
      checkExistingPortfolio();
    }
  }, [user, loading, navigate]);
  const checkExistingPortfolio = async () => {
    if (!user?.user_id) return;

    try {
      const existingStats = await csgoAPI.getStatsByUser(user.user_id);
      if (existingStats) {
        // Populate form with existing data
        setFormData({
          username: existingStats.username || "",
          in_game_id: existingStats.in_game_id || "",

          current_rank: existingStats.current_rank || "",
          highest_rank: existingStats.highest_rank || "",
          mm_rank: existingStats.mm_rank || "",

          faceit_level: existingStats.faceit_level?.toString() || "",
          elo: existingStats.elo?.toString() || "",

          kd_ratio: existingStats.kd_ratio?.toString() || "",
          headshot_percentage:
            existingStats.headshot_percentage?.toString() || "",

          kills: existingStats.kills?.toString() || "",
          deaths: existingStats.deaths?.toString() || "",
          assists: existingStats.assists?.toString() || "",
          mvps: existingStats.mvps?.toString() || "",

          matches_played: existingStats.matches_played?.toString() || "",
          wins: existingStats.wins?.toString() || "",
          win_rate: existingStats.win_rate?.toString() || "",

          avg_damage_per_round:
            existingStats.avg_damage_per_round?.toString() || "",
          avg_kills_per_round:
            existingStats.avg_kills_per_round?.toString() || "",

          rounds_played: existingStats.rounds_played?.toString() || "",
          bomb_plants: existingStats.bomb_plants?.toString() || "",
          bomb_defuses: existingStats.bomb_defuses?.toString() || "",
          flash_assists: existingStats.flash_assists?.toString() || "",
        });

        setExistingStatsId(existingStats.id);
        setIsUpdate(true);
      }
    } catch (error) {
      // No existing portfolio, continue with creation
      console.log("No existing portfolio found, proceeding with creation");
    }
  };
  const ranks = [
    "Silver I",
    "Silver II",
    "Silver III",
    "Silver IV",
    "Silver Elite",
    "Silver Elite Master",
    "Gold Nova I",
    "Gold Nova II",
    "Gold Nova III",
    "Gold Nova Master",
    "Master Guardian I",
    "Master Guardian II",
    "Master Guardian Elite",
    "Distinguished Master Guardian",
    "Legendary Eagle",
    "Legendary Eagle Master",
    "Supreme Master First Class",
    "Global Elite",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        alert("Please select a valid video file");
        return;
      }
      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        alert("Video file size must be less than 100MB");
        return;
      }
      setVideoFile(file);
    }
  };

  // const csgoFields: Record<string, FieldConfig[]> = {
  const csgoFields: Record<string, FieldConfig[]> = useMemo(
    () => ({
      player: [
        { name: "username", label: "Username *", type: "text", required: true },
        {
          name: "in_game_id",
          label: "In-Game ID *",
          type: "text",
          required: true,
        },
      ],
      ranking: [
        {
          name: "current_rank",
          label: "Current Rank",
          type: "select",
          options: ranks,
        },
        {
          name: "highest_rank",
          label: "Highest Rank",
          type: "select",
          options: ranks,
        },
        { name: "mm_rank", label: "MM Rank", type: "select", options: ranks },
        { name: "faceit_level", label: "FACEIT Level", type: "number" },
        { name: "elo", label: "ELO", type: "number" },
      ],
      combat: [
        { name: "kd_ratio", label: "K/D Ratio", type: "number", step: "0.01" },
        {
          name: "headshot_percentage",
          label: "Headshot %",
          type: "number",
          step: "0.1",
        },
        { name: "kills", label: "Kills", type: "number" },
        { name: "deaths", label: "Deaths", type: "number" },
        { name: "assists", label: "Assists", type: "number" },
        { name: "mvps", label: "MVPs", type: "number" },
      ],
      matches: [
        { name: "matches_played", label: "Matches Played", type: "number" },
        { name: "wins", label: "Wins", type: "number" },
        { name: "win_rate", label: "Win Rate %", type: "number", step: "0.1" },
        { name: "rounds_played", label: "Rounds Played", type: "number" },
      ],
      averages: [
        {
          name: "avg_damage_per_round",
          label: "Avg Damage / Round",
          type: "number",
        },
        {
          name: "avg_kills_per_round",
          label: "Avg Kills / Round",
          type: "number",
        },
      ],
      utility: [
        { name: "bomb_plants", label: "Bomb Plants", type: "number" },
        { name: "bomb_defuses", label: "Bomb Defuses", type: "number" },
        { name: "flash_assists", label: "Flash Assists", type: "number" },
      ],
    }),
    []
  );
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !user) {
      alert("Please login to create a portfolio");
      navigate("/login");
      return;
    }

    try {
      const form = new FormData();

      // Convert empty strings to 0 for number fields
      const numberFields = [
        "faceit_level",
        "elo",
        "kd_ratio",
        "headshot_percentage",
        "kills",
        "deaths",
        "assists",
        "mvps",
        "matches_played",
        "wins",
        "win_rate",
        "avg_damage_per_round",
        "avg_kills_per_round",
        "rounds_played",
        "bomb_plants",
        "bomb_defuses",
        "flash_assists",
      ];

      Object.entries(formData).forEach(([key, value]) => {
        if (numberFields.includes(key)) {
          form.append(key, value === "" ? "0" : value.toString());
        } else {
          form.append(key, value.toString());
        }
      });

      // Add video if selected
      if (videoFile) {
        form.append("video", videoFile);
      }

      const url =
        isUpdate && existingStatsId
          ? `http://localhost:5000/games/csgo/stats/${existingStatsId}`
          : `http://localhost:5000/games/csgo/stats`;

      const response = await fetch(url, {
        method: isUpdate ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Do NOT set Content-Type manually
        },
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save portfolio");
      }

      const data = await response.json();
      console.log(data);

      alert(
        isUpdate
          ? "Portfolio updated successfully!"
          : "Portfolio created successfully!"
      );
      navigate("/players/csgo");
    } catch (error) {
      console.error("Error saving portfolio:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save portfolio. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="create-portfolio-page">
        <div className="page-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="create-portfolio-page-csgo ">
      <div className="page-container">
        <div className="page-header">
          <h1>
            {isUpdate ? "Update CSGO Portfolio" : "Create CSGO Portfolio"}
          </h1>
          {isUpdate && (
            <div className="update-message">
              You can have only one portfolio per game, update details if needed
            </div>
          )}
          <button
            className="back-btn"
            onClick={() => navigate("/players/csgo")}
          >
            ← Back to Players
          </button>
        </div>

        <form onSubmit={handleSubmit} className="portfolio-form">
          {Object.entries(csgoFields).map(([section, fields]) => (
            <div className="form-section" key={section}>
              <h3>{section.toUpperCase()}</h3>
              <div className="form-row">
                {fields.map((field) => (
                  <FormInput
                    key={field.name}
                    field={field}
                    value={formData[field.name]?.toString() ?? ""}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="form-section">
            <h3>Gameplay Highlights</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="highlight_video">
                  Best Gameplay Highlights (MP4 Video)
                </label>
                <input
                  type="file"
                  id="highlight_video"
                  name="highlight_video"
                  accept="video/mp4,video/*"
                  onChange={handleVideoChange}
                />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/players/csgo")}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {isUpdate ? "Update Portfolio" : "Create Portfolio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCsgoPortfolioPage;
