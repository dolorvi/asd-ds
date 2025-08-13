import { useEffect } from "react";

export function useClickSound() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof AudioContext === "undefined") {
      return;
    }
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const play = () => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = 440;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    };

    const handler = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === "BUTTON") {
        play();
      }
    };

    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("click", handler);
      audioCtx.close();
    };
  }, []);
}
