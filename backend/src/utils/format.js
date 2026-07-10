function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const num = parseFloat(value);
  if (Math.abs(num) >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`;
  if (Math.abs(num) >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`;
  if (Math.abs(num) >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`;
  if (Math.abs(num) >= 1e5) return `₹${(num / 1e5).toFixed(2)}L`;
  return `₹${num.toFixed(2)}`;
}

function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${parseFloat(value).toFixed(2)}%`;
}

function formatMultiple(value) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${parseFloat(value).toFixed(2)}x`;
}

function safeNumber(value, fallback = null) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

function calculateGrowthRate(current, previous) {
  if (!current || !previous || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

module.exports = {
  formatCurrency,
  formatPercent,
  formatMultiple,
  safeNumber,
  calculateGrowthRate,
};
