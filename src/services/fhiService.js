/**
 * Fish Health Index (FHI)
 * Menghitung skor kesehatan kolam 0-100 berdasarkan data sensor.
 * Makin tinggi = makin sehat.
 */

function calculateFHI({ ph, temperature, turbidity }) {
  let score = 100;

  // pH ideal: 6.5 - 9.0
  if (ph < 6.0 || ph > 9.5)         score -= 40;
  else if (ph < 6.5 || ph > 9.0)    score -= 20;

  // Suhu ideal: 25 - 30°C
  if (temperature < 20 || temperature > 35)       score -= 30;
  else if (temperature < 25 || temperature > 30)  score -= 10;

  // Turbidity ideal: < 50 NTU
  if (turbidity > 100)      score -= 30;
  else if (turbidity > 50)  score -= 15;

  return Math.max(0, score);
}

function getAlerts({ ph, temperature, turbidity }) {
  const alerts = [];

  if (ph < 6.5)          alerts.push({ type: 'ph_low',    message: 'pH terlalu rendah' });
  if (ph > 9.0)          alerts.push({ type: 'ph_high',   message: 'pH terlalu tinggi' });
  if (temperature > 32)  alerts.push({ type: 'temp_high', message: 'Suhu terlalu panas' });
  if (temperature < 22)  alerts.push({ type: 'temp_low',  message: 'Suhu terlalu dingin' });
  if (turbidity > 80)    alerts.push({ type: 'turbid',    message: 'Air terlalu keruh' });

  return alerts;
}

module.exports = { calculateFHI, getAlerts };
