import { useEffect, useRef } from "react";

interface VoiceListeningGlowProps {
  volume: number;
  isListening: boolean;
}

export const VoiceListeningGlow = ({ volume, isListening }: VoiceListeningGlowProps) => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!glowRef.current || !isListening) return;

    const normalizedVolume = Math.min(Math.max(volume / 100, 0), 1);

    const blurAmount = 20 + normalizedVolume * 40;
    
    const spreadAmount = 5 + normalizedVolume * 15;

    const opacity = 0.3 + normalizedVolume * 0.4;

    glowRef.current.style.boxShadow = `0 -${spreadAmount}px ${blurAmount}px rgba(var(--color-primary-default), ${opacity})`;
  }, [volume, isListening]);

  if (!isListening) return null;

  return (
    <div
      ref={glowRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: "inherit",
        pointerEvents: "none",
        transition: "box-shadow 0.1s ease-out",
        zIndex: 0
      }}
    />
  );
};