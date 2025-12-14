"use client";
import { PixelatedCanvas } from "@/components/ui/pixelated-canvas";
import { useState, useEffect } from "react";
 
export function Controller() {
  const [dimensions, setDimensions] = useState({ width: 750, height: 500 });

  useEffect(() => {
    const updateDimensions = () => {
      if (window.innerWidth <= 360) {
        setDimensions({ width: 280, height: 187 });
      } else if (window.innerWidth <= 480) {
        setDimensions({ width: 360, height: 240 });
      } else if (window.innerWidth <= 768) {
        setDimensions({ width: 500, height: 333 });
      } else if (window.innerWidth <= 1024) {
        setDimensions({ width: 600, height: 400 });
      } else {
        setDimensions({ width: 750, height: 500 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="controller-wrapper">
      <PixelatedCanvas
        src="/Controller.png"
        width={dimensions.width}
        height={dimensions.height}
        cellSize={1}
        dotScale={0.8}
        shape="square"
        backgroundColor="transparent"
        dropoutStrength={0.7}
        interactive
        distortionStrength={5}
        distortionRadius={120}
        distortionMode="swirl"
        followSpeed={0.2}
        jitterStrength={8}
        jitterSpeed={6}
        sampleAverage
        tintColor="#FFFFFF"
        tintStrength={0.2}
        className="rounded-xl shadow-lg"
      />
    </div>
  );
}