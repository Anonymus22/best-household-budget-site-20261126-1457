// store.js — one job: hold the household's state, persist it on this device,
// and answer every "how much?" question the pages ask.
//
// The state is plain JSON in localStorage under STORAGE_KEY. Seed data comes
// from data.js and is cloned, so the module's seed rows are never mutated.

import { CATEGORIES, EXPENSE_CATEGORIES, MONTHS, monthKeyOf, seedState } from './data.js';

export const STORAGE_KEY = 'hartono-budget-v1';

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && Array.isArray(parsed.transactions)) return parsed;
    }
  } catch (err) {
    // A damaged save falls back to the seed data rather than a blank page.
  }
  const fresh = seedState();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); } catch (err) { /* storage unavailable */ }
  return fresh;
}

export function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (err) { /* storage unavailable */ }
}

export function getState() {
  return state;
}

export function resetState() {
  state = seedState();
  saveState();
  return state;
}

export function setMonth(month) {
  if (MONTHS.includes(month)) {
    state.month = month;
    saveState();
  }
  return state.month;
}

export function currentMonth() {
  return state.month;
}

// ---- queries -------------------------------------------------------------

export function transactionsFor(month) {
  return state.transactions
    .filter((tx) => monthKeyOf(tx.date) === month)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function monthTotals(month) {
  let income = 0;
  let spending = 0;
  for (const tx of state.transactions) {
    if (monthKeyOf(tx.date) !== month) continue;
    if (tx.amount >= 0) income += tx.amount;
    else spending += -tx.amount;
  }
  return { income, spending, saved: income - spending };
}

export function spentByCategory(month) {
  const out = {};
  for (const cat of EXPENSE_CATEGORIES) out[cat] = 0;
  for (const tx of state.transactions) {
    if (monthKeyOf(tx.date) !== month || tx.amount >= 0) continue;
    if (out[tx.category] === undefined) out[tx.category] = 0;
    out[tx.category] += -tx.amount;
  }
  return out;
}

export function budgetStatus(month) {
  const spent = spentByCategory(month);
  return EXPENSE_CATEGORIES.map((cat) => {
    const budget = state.budgets[cat] || 0;
    const used = spent[cat] || 0;
    const left = budget - used;
    const pct = budget > 0 ? (used / budget) * 100 : 0;
    return { category: cat, budget, used, left, pct };
  });
}

export function totalBudget() {
  return EXPENSE_CATEGORIES.reduce((sum, cat) => sum + (state.budgets[cat] || 0), 0);
}

export function upcomingBills(month) {
  // The demo's "today" is 26 November 2026: a bill is overdue when its due
  // date has passed and it is still unpaid for that month.
  const today = '2026-11-26';
  return state.bills
    .map((bill) => {
      const paid = bill.paid.includes(month);
      const dueDate = month + '-' + String(bill.dueDay).padStart(2, '0');
      const overdue = !paid && dueDate < today;
      return { ...bill, paid, overdue };
    })
    .sort((a, b) => a.dueDay - b.dueDay);
}

export function billsDueCount(month) {
  return state.bills.filter((bill) => !bill.paid.includes(month)).length;
}

export function totalSavedGoals() {
  return state.goals.reduce((sum, goal) => sum + goal.saved, 0);
}

export function biggestExpense(month) {
  let best = null;
  for (const tx of state.transactions) {
    if (monthKeyOf(tx.date) !== month || tx.amount >= 0) continue;
    if (!best || tx.amount < best.amount) best = tx;
  }
  return best;
}

// ---- mutations -----------------------------------------------------------

export function addTransaction(fields) {
  const tx = {
    id: 'tx-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1000),
    date: fields.date,
    description: fields.description.trim(),
    category: fields.category,
    amount: fields.amount,
    note: (fields.note || '').trim(),
  };
  state.transactions.push(tx);
  saveState();
  return tx;
}

export function updateTransaction(id, fields) {
  const tx = state.transactions.find((item) => item.id === id);
  if (!tx) return null;
  tx.date = fields.date;
  tx.description = fields.description.trim();
  tx.category = fields.category;
  tx.amount = fields.amount;
  tx.note = (fields.note || '').trim();
  saveState();
  return tx;
}

export function deleteTransaction(id) {
  state.transactions = state.transactions.filter((item) => item.id !== id);
  saveState();
}

export function setBudget(category, amount) {
  if (!CATEGORIES.includes(category)) return;
  state.budgets[category] = Math.max(0, Math.round(amount));
  saveState();
}

export function toggleBillPaid(billId, month) {
  const bill = state.bills.find((item) => item.id === billId);
  if (!bill) return;
  const index = bill.paid.indexOf(month);
  if (index >= 0) bill.paid.splice(index, 1);
  else bill.paid.push(month);
  saveState();
}

export function addBill(fields) {
  const bill = {
    id: 'bill-' + Date.now().toString(36),
    name: fields.name.trim(),
    detail: fields.detail.trim(),
    amount: fields.amount,
    dueDay: fields.dueDay,
    category: fields.category,
    paid: [],
  };
  state.bills.push(bill);
  saveState();
  return bill;
}

export function addGoalFunds(goalId, amount) {
  const goal = state.goals.find((item) => item.id === goalId);
  if (!goal) return null;
  goal.saved = Math.max(0, Math.min(goal.target, goal.saved + amount));
  saveState();
  return goal;
}

export function addGoal(fields) {
  const goal = {
    id: 'goal-' + Date.now().toString(36),
    name: fields.name.trim(),
    note: fields.note.trim(),
    target: fields.target,
    saved: fields.saved || 0,
    color: fields.color || '#14532d',
  };
  state.goals.push(goal);
  saveState();
  return goal;
}

export function setGoalTarget(goalId, target) {
  const goal = state.goals.find((item) => item.id === goalId);
  if (!goal) return null;
  goal.target = Math.max(1, Math.round(target));
  if (goal.saved > goal.target) goal.saved = goal.target;
  saveState();
  return goal;
}
