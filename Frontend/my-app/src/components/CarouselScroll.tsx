interface VideoCarouselProps {
  videos: string[];
}

export default function VideoCarousel({ videos }: VideoCarouselProps) {
  if (!videos.length) return null;

  return (
    <section className="video-carousel">
      <div
        className="video-track"
        style={{ justifyContent: videos.length === 1 ? "center" : "flex-start" }}
      >
        {videos.map((src) => (
          <div className="video-card" key={src}>
            <video
              src={src}
              controls
              muted
              preload="metadata"
              playsInline
            />
          </div>
        ))}
      </div>
    </section>
  );
}
