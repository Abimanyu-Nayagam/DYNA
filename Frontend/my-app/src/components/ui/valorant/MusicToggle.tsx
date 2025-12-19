import { useEffect, useRef, useState } from "react";

export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [enabled, setEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem("valoMusic");
    return stored === null || stored === "on"; // default ON
  });

  /* ===============================
     AUTOPLAY ON MOUNT
  =============================== */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.75;

    if (enabled) {
      audio.play().catch(() => {
        // Browser may block autoplay — silently ignore
        console.warn("Autoplay blocked by browser");
      });
    }

    // 🔥 STOP MUSIC WHEN LEAVING VALORANT PAGE
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []); // run ONCE on mount

  /* ===============================
     TOGGLE HANDLER
  =============================== */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    localStorage.setItem("valoMusic", enabled ? "on" : "off");

    if (enabled) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [enabled]);

  const toggleMusic = () => {
    setEnabled(prev => !prev);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/Valorant/VALORANTsong.mp3"
        loop
        preload="auto"
      />

      <button
        className="valo-music-toggle"
        onClick={toggleMusic}
        aria-label="Toggle background music"
        title={enabled ? "Mute music" : "Play music"}
      >
        {enabled ? "🔊" : "🔇"}
      </button>
    </>
  );
}
