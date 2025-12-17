import { useEffect, useRef, useState } from "react";

export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [enabled, setEnabled] = useState(
    localStorage.getItem("valoMusic") === "on"
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.25;
    localStorage.setItem("valoMusic", enabled ? "on" : "off");
  }, [enabled]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (enabled) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        console.warn("Audio play blocked");
      });
    }

    setEnabled(v => !v);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/valorant/valorant-theme.mp3"  // 🔴 lowercase path
        loop
        preload="auto"
      />

      <button
        className="valo-music-toggle"
        onClick={toggleMusic}
        aria-label="Toggle Valorant music"
      >
        {enabled ? "🔊" : "🔇"}
      </button>
    </>
  );
}
