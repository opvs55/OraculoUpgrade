// src/utils/isoWeek.js
//
// Calcula a referência de semana ISO-8601 (formato "YYYY-Www") no mesmo
// padrão que o backend espera em endpoints como /oracles/central/generate.
export function getCurrentWeekRef(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // domingo (0) vira 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // quinta-feira da semana ISO atual
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}
