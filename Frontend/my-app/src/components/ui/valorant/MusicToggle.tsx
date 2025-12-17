import { useEffect, useRef, useState } from "react";

export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteracted = useRef(false);

  const [enabled, setEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem("valoMusic");
    return stored === null || stored === "on"; // default ON
  });

  // Persist preference
  useEffect(() => {
    localStorage.setItem("valoMusic", enabled ? "on" : "off");
  }, [enabled]);

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    hasInteracted.current = true;

    try {
      if (enabled) {
        audio.pause();
      } else {
        audio.volume = 0.75;
        await audio.play(); // ✅ DIRECT user gesture
      }
      setEnabled(prev => !prev);
    } catch (err) {
      console.warn("Audio play failed:", err);
    }
  };

  // Auto-start AFTER first interaction if enabled
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (enabled && hasInteracted.current) {
      audio.volume = 0.75;
      audio.play().catch(() => {});
    }
  }, [enabled]);

useEffect(() => {
  const unlockAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = false;
    audio.volume = 0.75;
    audio.play().catch(() => {});
  };

  if (enabled) {
    window.addEventListener("pointerdown", unlockAudio, { once: true });
  }

  return () => window.removeEventListener("pointerdown", unlockAudio);
}, [enabled]);



  return (
    <>
      <audio
        ref={audioRef}
        src="/Valorant/VALORANTsong.mp3"
        loop
        preload="auto"
        muted
      />

      <button
        className="valo-music-toggle"
        onClick={toggleMusic}
        aria-label="Toggle background music"
        title="Toggle background music"
      >
        {enabled ? "🔊" : "🔇"}
      </button>
    </>
  );
}
