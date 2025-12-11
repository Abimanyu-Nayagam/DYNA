"use client";
import { PixelatedCanvas } from "@/components/ui/pixelated-canvas";
 
export function Controller() {
  return (
    <div className="mx-auto mt-8">
      <PixelatedCanvas
        src="/Controller.png"
         width={750}
        height={500}
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