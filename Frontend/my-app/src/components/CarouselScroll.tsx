import { useRef, useState } from "react";

interface VideoCarouselProps {
  videos: string[];
}

export default function VideoCarousel({ videos }: VideoCarouselProps) {
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // Drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    console.log(hoveredIdx);
    console.log(isAutoScrolling);
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX);
    setScrollStart(trackRef.current.scrollLeft);
    trackRef.current.classList.add("dragging");
  };

  // Drag move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    const delta = e.pageX - startX;
    trackRef.current.scrollLeft = scrollStart - delta;
  };

  // Drag end
  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    trackRef.current?.classList.remove("dragging");
  };

  // Hover to play and center
  const handleMouseEnterVideo = (idx: number) => {
    const video = videoRefs.current[idx];
    const track = trackRef.current;
    if (!video || !track) return;

    // Play only hovered video
    videoRefs.current.forEach((v, i) => {
      if (i === idx) v.play().catch(() => {});
      else v.pause();
    });

    // Check if the video is fully visible
    const videoRect = video.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();

    const isFullyVisible =
      videoRect.left >= trackRect.left &&
      videoRect.right <= trackRect.right;

    if (!isFullyVisible) {
      // Scroll to center
      const offset = videoRect.left - trackRect.left - trackRect.width / 2 + videoRect.width / 2;

      setIsAutoScrolling(true);
      track.scrollBy({
        left: offset,
        behavior: "smooth",
      });

      setTimeout(() => setIsAutoScrolling(false), 500); // match smooth scroll duration
    }
  };



  const handleMouseLeaveVideo = (idx: number) => {
    setHoveredIdx(null); // Reset hovered index
    const video = videoRefs.current[idx];
    if (video) video.pause();
  };

  if (!videos.length) return null;

  return (
    <section className="lol-video-carousel">
      <div
        ref={trackRef}
        className="lol-video-track"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {videos.map((src, idx) => (
          <div className="lol-video-card" key={src}>
            <video
              src={src}
              muted
              loop
              playsInline
              preload="metadata"
              ref={(el) => {
                if (el) {
                  videoRefs.current[idx] = el;
                }
              }}
              onMouseEnter={() => handleMouseEnterVideo(idx)}
              onMouseLeave={() => handleMouseLeaveVideo(idx)}
              style={{ cursor: "pointer" }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
