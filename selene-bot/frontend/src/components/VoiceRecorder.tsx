import { useState, useRef } from "react"

export function useAudioVisualizer() {
  const [volume, setVolume] = useState(0)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationRef = useRef<number | null>(null)

  const startVisualizer = async () => {
    try {
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      }

      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioContextClass()
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256

        sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current)
        sourceRef.current.connect(analyserRef.current)
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume()
      }

      const dataArray = new Uint8Array(analyserRef.current!.frequencyBinCount)
      const update = () => {
        if (audioContextRef.current?.state === "running" && analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
          setVolume(average)
          animationRef.current = requestAnimationFrame(update)
        }
      }
      update()
    } catch (err) {
      console.error("Visualizer error:", err)
    }
  }

  const stopVisualizer = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    if (audioContextRef.current && audioContextRef.current.state === "running") {
      audioContextRef.current.suspend()
    }
    setVolume(0)
  }

  return { volume, startVisualizer, stopVisualizer }
}

export const VoiceDots = ({ volume, isActive }: { volume: number, isActive: boolean }) => {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: '2px',
            height: '2px',
            backgroundColor: isActive ? 'var(--color-outline)' : '#888',
            borderRadius: '50%',
            transform: isActive ? `scale(${1 + volume / 40})` : 'scale(1)',
            transition: 'transform 0.05s ease',
            transitionDelay: isActive ? `${i * 0.001}s` : '0s'
          }}
        />
      ))}
    </div>
  );
};