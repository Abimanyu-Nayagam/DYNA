import { useEffect, useRef, useState } from "react";

interface RankAnimationProps {
  rank: string;
}

export default function RankAnimation({ rank }: RankAnimationProps) {
  const [step, setStep] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!rank) return null;
  const normalizedRank = rank.toLowerCase();

  const rankMapFrom = {
    unranked: "/videos/rank-from/tier-promotion-from-unranked.webm",
    iron: "/videos/rank-from/tier-promotion-from-iron.webm",
    bronze: "/videos/rank-from/tier-promotion-from-bronze.webm",
    silver: "/videos/rank-from/tier-promotion-from-silver.webm",
    gold: "/videos/rank-from/tier-promotion-from-gold.webm",
    platinum: "/videos/rank-from/tier-promotion-from-platinum.webm",
    diamond: "/videos/rank-from/tier-promotion-from-diamond.webm",
    master: "/videos/rank-from/tier-promotion-from-master.webm",
    grandmaster: "/videos/rank-from/tier-promotion-from-grandmaster.webm"
  };

  const rankMapTo = {
    iron: "/videos/rank-to/tier-promotion-to-iron.webm",
    bronze: "/videos/rank-to/tier-promotion-to-bronze.webm",
    silver: "/videos/rank-to/tier-promotion-to-silver.webm",
    gold: "/videos/rank-to/tier-promotion-to-gold.webm",
    platinum: "/videos/rank-to/tier-promotion-to-platinum.webm",
    diamond: "/videos/rank-to/tier-promotion-to-diamond.webm",
    master: "/videos/rank-to/tier-promotion-to-master.webm",
    grandmaster: "/videos/rank-to/tier-promotion-to-grandmaster.webm",
    challenger: "/videos/rank-to/tier-promotion-to-challenger.webm",
  };

  const videos = [rankMapFrom["unranked"], rankMapTo[normalizedRank]];

  // Preload second video while first is playing
  useEffect(() => {
    const preloadVideo = (url: string) => {
      const vid = document.createElement("video");
      vid.src = url;
      vid.preload = "auto";
    };

    preloadVideo(videos[1]);
  }, [videos]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const handleEnded = () => {
      if (step === 0) {
        setStep(1); // move to second video
      }
    };

    vid.addEventListener("ended", handleEnded);
    return () => vid.removeEventListener("ended", handleEnded);
  }, [step]);

  return (
    <video
      key={step}
      ref={videoRef}
      src={videos[step]}
      autoPlay
      muted
      playsInline
      className="w-full max-w-[800px] mx-auto"
    />
  );
}
