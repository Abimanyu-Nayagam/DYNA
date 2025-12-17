import { useEffect, useRef } from "react";

interface ScrollFadeInProps {
  children: React.ReactNode;
}

export default function ScrollFadeIn({ children }: ScrollFadeInProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("animate-fadein");
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="opacity-0">
      {children}
    </div>
  );
}
