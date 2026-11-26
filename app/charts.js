// charts.js — one job: draw the site's charts on <canvas>, in code.
// No chart library is vendored; these two small draw functions are all the
// site needs, which keeps the first load small.

import { CATEGORY_COLORS, fmtMoney } from './data.js';

// Donut of spending by category. `entries` is [{ label, value, color }].
// The centre shows the month's total spending.
export function drawDonut(canvas, entries, total) {
  const size = 260;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = size * ratio;
  canvas.height = size * ratio;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const outer = 122;
  const inner = 76;

  if (!entries.length || total <= 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.fillStyle = '#f3ecdc';
    ctx.fill();
    ctx.fillStyle = '#5f6f63';
    ctx.font = '600 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No spending yet', cx, cy);
    return;
  }

  let angle = -Math.PI / 2;
  for (const entry of entries) {
    const sweep = (entry.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = entry.color;
    ctx.fill();
    angle += sweep;
  }
  // Punch the hole, leaving a ring.
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  ctx.fillStyle = '#0e3b22';
  ctx.font = '800 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(fmtMoney(total), cx, cy - 2);
  ctx.fillStyle = '#5f6f63';
  ctx.font = '600 13px sans-serif';
  ctx.fillText('spent this month', cx, cy + 20);
}

// Grouped bars: for each month, an income bar and a spending bar.
// `months` is [{ label, income, spending }].
export function drawTrend(canvas, months) {
  const width = 640;
  const height = 300;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, width, height);

  const padLeft = 56;
  const padRight = 12;
  const padTop = 26;
  const padBottom = 30;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxVal = Math.max(1000, ...months.flatMap((m) => [m.income, m.spending]));
  const top = Math.ceil(maxVal / 2000) * 2000;
  const y = (value) => padTop + plotH - (value / top) * plotH;

  // Gridlines and y labels.
  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#5f6f63';
  ctx.textAlign = 'right';
  ctx.strokeStyle = '#e3dac7';
  ctx.lineWidth = 1;
  for (let step = 0; step <= 4; step += 1) {
    const value = (top / 4) * step;
    const yy = y(value);
    ctx.beginPath();
    ctx.moveTo(padLeft, yy);
    ctx.lineTo(width - padRight, yy);
    ctx.stroke();
    ctx.fillText('$' + (value / 1000) + 'k', padLeft - 8, yy + 4);
  }

  // Legend.
  ctx.textAlign = 'left';
  ctx.fillStyle = '#15803d';
  ctx.fillRect(padLeft, 6, 12, 12);
  ctx.fillStyle = '#1c2b21';
  ctx.fillText('Income', padLeft + 18, 16);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(padLeft + 90, 6, 12, 12);
  ctx.fillStyle = '#1c2b21';
  ctx.fillText('Spending', padLeft + 108, 16);

  const groupW = plotW / months.length;
  const barW = Math.min(56, (groupW - 40) / 2);
  months.forEach((month, i) => {
    const groupX = padLeft + i * groupW;
    const incomeX = groupX + (groupW - barW * 2 - 10) / 2;
    const spendX = incomeX + barW + 10;

    ctx.fillStyle = '#15803d';
    ctx.fillRect(incomeX, y(month.income), barW, padTop + plotH - y(month.income));
    ctx.fillStyle = '#d97706';
    ctx.fillRect(spendX, y(month.spending), barW, padTop + plotH - y(month.spending));

    ctx.fillStyle = '#1c2b21';
    ctx.font = '700 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(fmtMoney(month.income), incomeX + barW / 2, y(month.income) - 6);
    ctx.fillText(fmtMoney(month.spending), spendX + barW / 2, y(month.spending) - 6);

    ctx.fillStyle = '#5f6f63';
    ctx.font = '600 13px sans-serif';
    ctx.fillText(month.label, groupX + groupW / 2, height - 8);
  });
}

export { CATEGORY_COLORS };
