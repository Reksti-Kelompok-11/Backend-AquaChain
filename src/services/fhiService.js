/**
 * Fish Health Index (FHI)
 * Menghitung skor kesehatan kolam 0-100 berdasarkan data sensor.
 * Makin tinggi = makin sehat.
 */

function calculateFHI({ ph, temperature, turbidity }) {
  let score = 100;

  // pH ideal: 6.5 - 8.0
  if (ph < 6.5 || ph > 8.5)         score -= 60;
  else if (ph < 7 || ph > 8)    score -= 20;

  // Suhu ideal: 25 - 30°C
  if (temperature < 20 || temperature > 33)       score -= 60;
  else if (temperature < 25 || temperature > 30)  score -= 20;

  // Turbidity ideal: < 5 NTU
  if (turbidity > 100)      score -= 60;
  else if (turbidity > 10)  score -= 20;

  return Math.max(0, score);
}

function getAlerts({ ph, temperature, turbidity }) {
  const alerts = [];
  const fhi = calculateFHI({ ph, temperature, turbidity });

  if (fhi < 50) {
    alerts.push({ type: 'fhi_low', message: 'Bahaya! Kesehatan kolam sangat buruk' });
  } else if (fhi < 80) {
    alerts.push({ type: 'fhi_medium', message: 'Waspada! Kesehatan kolam cukup buruk' });
  }

  return alerts;
}

module.exports = { calculateFHI, getAlerts };
