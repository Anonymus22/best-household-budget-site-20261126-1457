// Hartono household — sample data for October, November and December 2026.
// Amounts are in US dollars. Expenses are negative, income is positive.
// This file only holds the starting figures; the app's state lives in store.js.

export const HOUSEHOLD_NAME = 'Hartono household';

export const MONTHS = ['2026-10', '2026-11', '2026-12'];

export const MONTH_LABELS = {
  '2026-10': 'October 2026',
  '2026-11': 'November 2026',
  '2026-12': 'December 2026',
};

export const CATEGORIES = [
  'Housing',
  'Groceries',
  'Transport',
  'Utilities',
  'Dining',
  'Entertainment',
  'Health',
  'Savings',
  'Income',
  'Other',
];

export const EXPENSE_CATEGORIES = [
  'Housing',
  'Groceries',
  'Transport',
  'Utilities',
  'Dining',
  'Entertainment',
  'Health',
  'Savings',
  'Other',
];

export const CATEGORY_COLORS = {
  Housing: '#14532d',
  Groceries: '#65a30d',
  Transport: '#0e7490',
  Utilities: '#d97706',
  Dining: '#ea580c',
  Entertainment: '#7c3aed',
  Health: '#db2777',
  Savings: '#15803d',
  Income: '#166534',
  Other: '#64748b',
};

// Monthly budget targets per category (same plan every month).
export const DEFAULT_BUDGETS = {
  Housing: 1560,
  Groceries: 650,
  Transport: 320,
  Utilities: 240,
  Dining: 280,
  Entertainment: 180,
  Health: 150,
  Savings: 600,
  Other: 100,
};

// Recurring bills. `paid` lists the months already paid, as YYYY-MM.
export const SEED_BILLS = [
  { id: 'bill-rent', name: 'Home loan', detail: 'Hartono family home · auto-debit', amount: 1450, dueDay: 1, category: 'Housing', paid: ['2026-10', '2026-11'] },
  { id: 'bill-gym', name: 'Gym membership', detail: 'FitLife family plan · Rina & Budi', amount: 40, dueDay: 5, category: 'Health', paid: ['2026-10', '2026-11'] },
  { id: 'bill-electric', name: 'Electricity', detail: 'City Power · account 4417', amount: 118, dueDay: 10, category: 'Utilities', paid: ['2026-10', '2026-11'] },
  { id: 'bill-water', name: 'Water', detail: 'City Water · account 8820', amount: 44, dueDay: 12, category: 'Utilities', paid: ['2026-10', '2026-11'] },
  { id: 'bill-internet', name: 'Internet', detail: 'FastNet 100 Mbps · home fibre', amount: 65, dueDay: 15, category: 'Utilities', paid: ['2026-10', '2026-11'] },
  { id: 'bill-phone', name: 'Phone plan', detail: 'Mobile family plan · 2 lines', amount: 80, dueDay: 18, category: 'Utilities', paid: ['2026-10', '2026-11'] },
  { id: 'bill-car', name: 'Car insurance', detail: 'Family car · monthly premium', amount: 110, dueDay: 20, category: 'Transport', paid: ['2026-10', '2026-11'] },
  { id: 'bill-stream', name: 'Streaming', detail: 'Movie & music family plan', amount: 18, dueDay: 22, category: 'Entertainment', paid: ['2026-10', '2026-11'] },
  { id: 'bill-homeins', name: 'Home insurance', detail: 'Family home · quarterly premium split monthly', amount: 95, dueDay: 25, category: 'Housing', paid: ['2026-10'] },
];

export const SEED_GOALS = [
  { id: 'goal-emergency', name: 'Emergency fund', note: 'Six months of essentials, for peace of mind', target: 6000, saved: 3850, color: '#14532d' },
  { id: 'goal-holiday', name: 'Family holiday — Bali', note: 'Flights, a villa and surf lessons for the kids', target: 2400, saved: 1150, color: '#0e7490' },
  { id: 'goal-laptop', name: 'New laptop for Rina', note: 'For her design course starting in January', target: 1200, saved: 640, color: '#d97706' },
  { id: 'goal-renovation', name: 'Kitchen renovation', note: 'New cabinets and a bigger dining table', target: 4000, saved: 900, color: '#7c3aed' },
];

// Compact seed rows: [date, description, category, amount, note]
const OCT = [
  ['2026-10-01', 'Salary — Budi (October)', 'Income', 5200, 'Monthly pay, deposited'],
  ['2026-10-01', 'Home loan', 'Housing', -1450, 'Auto-debit, 1st of month'],
  ['2026-10-02', 'GreenMart weekly shop', 'Groceries', -148, 'Fruit, vegetables, rice, eggs'],
  ['2026-10-03', 'Fuel — family car', 'Transport', -52, 'Full tank'],
  ['2026-10-04', 'Electricity bill', 'Utilities', -118, 'September usage'],
  ['2026-10-05', 'Gym membership', 'Health', -40, 'Family plan'],
  ['2026-10-06', 'Dinner with family', 'Dining', -64, 'Warung Sederhana, 4 people'],
  ['2026-10-08', 'GreenMart weekly shop', 'Groceries', -132, 'Weekly groceries'],
  ['2026-10-09', 'Bus pass — Rina', 'Transport', -38, 'Monthly student pass'],
  ['2026-10-10', 'Water bill', 'Utilities', -44, 'October usage'],
  ['2026-10-12', 'Internet', 'Utilities', -65, '100 Mbps fibre'],
  ['2026-10-13', 'Pharmacy', 'Health', -36, 'Vitamins and cough syrup'],
  ['2026-10-15', 'GreenMart weekly shop', 'Groceries', -121, 'Weekly groceries'],
  ['2026-10-16', 'Movie night', 'Entertainment', -42, 'Cinema tickets x2'],
  ['2026-10-18', 'Phone plan', 'Utilities', -80, 'Two lines'],
  ['2026-10-19', 'Takeaway dinner', 'Dining', -28, 'Noodles for the family'],
  ['2026-10-20', 'Car insurance', 'Transport', -110, 'Monthly premium'],
  ['2026-10-21', 'GreenMart weekly shop', 'Groceries', -139, 'Weekly groceries'],
  ['2026-10-22', 'Streaming', 'Entertainment', -18, 'Family plan'],
  ['2026-10-24', 'Lunch out', 'Dining', -35, 'Weekend lunch'],
  ['2026-10-25', 'Home supplies', 'Housing', -57, 'Light bulbs, cleaning kit'],
  ['2026-10-25', 'Home insurance', 'Housing', -95, 'Monthly premium share'],
  ['2026-10-27', 'GreenMart weekly shop', 'Groceries', -98, 'Weekly groceries'],
  ['2026-10-28', 'Freelance design — Rina', 'Income', 350, 'Logo job, paid in full'],
  ['2026-10-29', 'Concert tickets', 'Entertainment', -85, 'Local band, two tickets'],
  ['2026-10-30', 'Savings transfer', 'Savings', -600, 'To emergency fund'],
];

const NOV = [
  ['2026-11-01', 'Salary — Budi (November)', 'Income', 5200, 'Monthly pay, deposited'],
  ['2026-11-01', 'Home loan', 'Housing', -1450, 'Auto-debit, 1st of month'],
  ['2026-11-02', 'GreenMart weekly shop', 'Groceries', -152, 'Fruit, vegetables, rice, eggs'],
  ['2026-11-03', 'Fuel — family car', 'Transport', -48, 'Full tank'],
  ['2026-11-04', 'Electricity bill', 'Utilities', -124, 'October usage'],
  ['2026-11-05', 'Gym membership', 'Health', -40, 'Family plan'],
  ['2026-11-06', 'School books — Dimas', 'Other', -46, 'Workbooks and pens'],
  ['2026-11-07', 'GreenMart weekly shop', 'Groceries', -128, 'Weekly groceries'],
  ['2026-11-08', 'Family lunch', 'Dining', -58, 'Sunday lunch out'],
  ['2026-11-10', 'Water bill', 'Utilities', -47, 'November usage'],
  ['2026-11-11', 'Dentist check-up', 'Health', -75, 'Dimas, six-month check'],
  ['2026-11-12', 'Internet', 'Utilities', -65, '100 Mbps fibre'],
  ['2026-11-13', 'GreenMart weekly shop', 'Groceries', -141, 'Weekly groceries'],
  ['2026-11-14', 'Cinema — family film', 'Entertainment', -38, 'Tickets x3'],
  ['2026-11-15', 'Takeaway dinner', 'Dining', -31, 'Fried chicken night'],
  ['2026-11-17', 'Bus pass — Rina', 'Transport', -38, 'Monthly student pass'],
  ['2026-11-18', 'Phone plan', 'Utilities', -80, 'Two lines'],
  ['2026-11-19', 'GreenMart weekly shop', 'Groceries', -135, 'Weekly groceries'],
  ['2026-11-20', 'Car insurance', 'Transport', -110, 'Monthly premium'],
  ['2026-11-21', 'Birthday gift — Grandma', 'Other', -52, 'Scarf and flowers'],
  ['2026-11-22', 'Streaming', 'Entertainment', -18, 'Family plan'],
  ['2026-11-23', 'Pharmacy', 'Health', -29, 'Allergy medicine'],
  ['2026-11-24', 'GreenMart weekly shop', 'Groceries', -118, 'Weekly groceries'],
  ['2026-11-25', 'Dinner with friends', 'Dining', -44, 'Rina and Budi'],
  ['2026-11-26', 'Savings transfer', 'Savings', -600, 'To emergency fund'],
];

const DEC = [
  ['2026-12-01', 'Salary — Budi (December)', 'Income', 5200, 'Monthly pay, deposited'],
  ['2026-12-01', 'Home loan', 'Housing', -1450, 'Auto-debit, 1st of month'],
  ['2026-12-02', 'GreenMart weekly shop', 'Groceries', -158, 'Weekly groceries'],
  ['2026-12-03', 'Fuel — family car', 'Transport', -55, 'Full tank'],
  ['2026-12-04', 'Electricity bill', 'Utilities', -131, 'November usage'],
  ['2026-12-05', 'Gym membership', 'Health', -40, 'Family plan'],
  ['2026-12-06', 'Holiday decorations', 'Other', -64, 'Lights and ornaments'],
  ['2026-12-08', 'GreenMart weekly shop', 'Groceries', -146, 'Weekly groceries'],
  ['2026-12-09', 'School concert tickets', 'Entertainment', -30, 'Dimas performs'],
  ['2026-12-10', 'Water bill', 'Utilities', -49, 'December usage'],
  ['2026-12-12', 'Internet', 'Utilities', -65, '100 Mbps fibre'],
  ['2026-12-14', 'GreenMart weekly shop', 'Groceries', -171, 'Holiday food shopping'],
  ['2026-12-15', 'Holiday gifts — family', 'Other', -180, 'Gifts for the kids'],
  ['2026-12-17', 'Bus pass — Rina', 'Transport', -38, 'Monthly student pass'],
  ['2026-12-18', 'Phone plan', 'Utilities', -80, 'Two lines'],
  ['2026-12-19', 'Festive dinner', 'Dining', -86, 'Family celebration'],
  ['2026-12-20', 'Car insurance', 'Transport', -110, 'Monthly premium'],
  ['2026-12-21', 'GreenMart weekly shop', 'Groceries', -164, 'Weekly groceries'],
  ['2026-12-22', 'Streaming', 'Entertainment', -18, 'Family plan'],
  ['2026-12-24', 'Holiday baking', 'Groceries', -42, 'Cookies and cake'],
  ['2026-12-26', 'Savings transfer', 'Savings', -600, 'To emergency fund'],
];

function rowsToTransactions(rows, prefix) {
  return rows.map((row, i) => ({
    id: prefix + '-' + String(i + 1).padStart(2, '0'),
    date: row[0],
    description: row[1],
    category: row[2],
    amount: row[3],
    note: row[4] || '',
  }));
}

// The full starting state. store.js clones this when it seeds localStorage,
// so editing the site never mutates this module's data.
export function seedState() {
  return {
    version: 1,
    month: '2026-11',
    budgets: { ...DEFAULT_BUDGETS },
    bills: SEED_BILLS.map((bill) => ({ ...bill, paid: [...bill.paid] })),
    goals: SEED_GOALS.map((goal) => ({ ...goal })),
    transactions: [
      ...rowsToTransactions(OCT, 'oct'),
      ...rowsToTransactions(NOV, 'nov'),
      ...rowsToTransactions(DEC, 'dec'),
    ],
  };
}

// ---- small formatting helpers used across the app ----

export function fmtMoney(amount) {
  const sign = amount < 0 ? '−$' : '$';
  return sign + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function fmtMoneySigned(amount) {
  const sign = amount < 0 ? '−$' : '+$';
  return sign + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function fmtDate(iso) {
  const parts = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[Number(parts[1]) - 1] + ' ' + Number(parts[2]);
}

export function monthKeyOf(iso) {
  return iso.slice(0, 7);
}

export function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
