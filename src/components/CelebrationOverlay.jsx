import React, { useEffect } from 'react';

const playJingle = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      gain.gain.setValueAtTime(0.0001, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.2, now + i * 0.09 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.085);
    });

    setTimeout(() => ctx.close?.(), 600);
  } catch {
    // ignore
  }
};

const CelebrationOverlay = ({ reward, stageId, onContinue }) => {
  useEffect(() => {
    playJingle();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500" />

        {/* Simple confetti-ish background */}
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="celebrate-sparkles" />
        </div>

        <div className="relative p-8 md:p-10 text-center">
          <div className="text-sm font-extrabold tracking-wider uppercase text-slate-500">
            Stage {stageId} cleared
          </div>
          <h2 className="mt-2 text-4xl md:text-5xl font-black text-slate-900">Nice work!</h2>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-amber-50 p-4">
              <div className="text-slate-600 text-sm font-semibold">Stars</div>
              <div className="mt-1 text-3xl font-black text-amber-700">+{reward?.stars ?? 0}</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <div className="text-slate-600 text-sm font-semibold">Coins</div>
              <div className="mt-1 text-3xl font-black text-emerald-700">+{reward?.coins ?? 0}</div>
            </div>
          </div>

          <button
            onClick={onContinue}
            className="mt-8 w-full rounded-2xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg hover:bg-indigo-700"
          >
            Continue
          </button>

          <div className="mt-3 text-xs text-slate-500">Tip: accuracy matters for stage clears.</div>
        </div>
      </div>
    </div>
  );
};

export default CelebrationOverlay;
