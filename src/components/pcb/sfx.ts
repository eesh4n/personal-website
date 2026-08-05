let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** PCB chip select/eject: high-passed noise burst (relay snap) + low thump. */
export function playChipEjectSound() {
  const ac = getCtx();
  const now = ac.currentTime;
  const clickDur = 0.018;
  const buf = ac.createBuffer(1, ac.sampleRate * clickDur, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const clickSrc = ac.createBufferSource();
  clickSrc.buffer = buf;
  const clickHP = ac.createBiquadFilter();
  clickHP.type = "highpass";
  clickHP.frequency.value = 2200;
  const clickGain = ac.createGain();
  clickGain.gain.setValueAtTime(0.5, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + clickDur);
  clickSrc.connect(clickHP).connect(clickGain).connect(ac.destination);
  clickSrc.start(now);

  const thunkStart = now + 0.02;
  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(160, thunkStart);
  osc.frequency.exponentialRampToValueAtTime(60, thunkStart + 0.09);
  const thunkGain = ac.createGain();
  thunkGain.gain.setValueAtTime(0.001, thunkStart);
  thunkGain.gain.linearRampToValueAtTime(0.35, thunkStart + 0.006);
  thunkGain.gain.exponentialRampToValueAtTime(0.001, thunkStart + 0.12);
  osc.connect(thunkGain).connect(ac.destination);
  osc.start(thunkStart);
  osc.stop(thunkStart + 0.13);
}

export function playNavClickSound() {
  const ac = getCtx();
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(920, now);
  osc.frequency.exponentialRampToValueAtTime(560, now + 0.05);
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.07);
}
