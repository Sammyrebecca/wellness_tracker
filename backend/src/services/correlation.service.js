const Entry = require('../models/Entry');
const { startOfDayUTC, addDaysUTC } = require('../utils/date');

function pearson(x, y) {
  const n = Math.min(x.length, y.length);
  if (n === 0) return { r: 0, n: 0 };
  const xs = x.slice(0, n);
  const ys = y.slice(0, n);
  const mx = xs.reduce((a,b)=>a+b,0) / n;
  const my = ys.reduce((a,b)=>a+b,0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i=0;i<n;i++) {
    const vx = xs[i]-mx; const vy = ys[i]-my;
    num += vx*vy; dx += vx*vx; dy += vy*vy;
  }
  const den = Math.sqrt(dx*dy) || 0;
  const r = den === 0 ? 0 : (num/den);
  return { r: Number(r.toFixed(3)), n };
}

async function correlations(userId, window = 30) {
  const w = [7, 14, 30].includes(Number(window)) ? Number(window) : 30;
  const end = startOfDayUTC(new Date());
  const start = addDaysUTC(end, -(w-1));
  const items = await Entry.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }).select('sleep mood steps water');
  const sleep = items.map(e=>e.sleep || 0);
  const mood = items.map(e=>e.mood || 0);
  const steps = items.map(e=>e.steps || 0);
  const water = items.map(e=>e.water || 0);

  const pairs = {
    sleep_mood: pearson(sleep, mood),
    steps_mood: pearson(steps, mood),
    water_mood: pearson(water, mood)
  };

  function label({ r, n }) {
    const a = Math.abs(r);
    let strength = 'none';
    if (a >= 0.7) strength = 'strong'; else if (a >= 0.4) strength = 'moderate'; else if (a >= 0.2) strength = 'weak';
    return { r, n, strength };
  }

  return { window: w, correlations: {
    sleep_mood: label(pairs.sleep_mood),
    steps_mood: label(pairs.steps_mood),
    water_mood: label(pairs.water_mood)
  }};
}

module.exports = { correlations };

