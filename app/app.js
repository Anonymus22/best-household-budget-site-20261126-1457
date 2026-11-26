// app.js — one job: route between pages, mount the views, and wire every
// control to the store. All clicks and submits are handled by delegation on
// #view, so no inline handlers are needed anywhere.

import { MONTHS, MONTH_LABELS, fmtMoney } from './data.js';
import {
  addBill,
  addGoal,
  addGoalFunds,
  addTransaction,
  currentMonth,
  deleteTransaction,
  getState,
  resetState,
  setBudget,
  setGoalTarget,
  setMonth,
  toggleBillPaid,
  updateTransaction,
} from './store.js';
import {
  afterRender,
  renderBills,
  renderBudgets,
  renderDashboard,
  renderGoals,
  renderReports,
  renderTransactions,
  txTableHtml,
} from './views.js';

const viewEl = document.getElementById('view');
const monthLabelEl = document.getElementById('month-label');
const prevBtn = document.getElementById('month-prev');
const nextBtn = document.getElementById('month-next');

// Transactions page keeps its filter and the transaction being edited here;
// both reset when the user leaves the page.
let txFilter = { query: '', category: 'all', kind: 'all' };
let editingId = null;
let notice = '';

const ROUTES = {
  dashboard: renderDashboard,
  transactions: (month) => renderTransactions(month, txFilter, editingTx()),
  budgets: renderBudgets,
  bills: renderBills,
  goals: renderGoals,
  reports: renderReports,
};

function editingTx() {
  if (!editingId) return null;
  return getState().transactions.find((tx) => tx.id === editingId) || null;
}

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  return ROUTES[hash] ? hash : 'dashboard';
}

function render() {
  const month = currentMonth();
  const route = currentRoute();

  monthLabelEl.textContent = MONTH_LABELS[month];
  const index = MONTHS.indexOf(month);
  prevBtn.disabled = index <= 0;
  nextBtn.disabled = index >= MONTHS.length - 1;

  document.querySelectorAll('.mainnav a').forEach((link) => {
    link.classList.toggle('active', link.dataset.route === route);
  });

  let html = ROUTES[route](month);
  if (notice) html = '<div class="success-note" role="status">' + notice + '</div>' + html;
  viewEl.innerHTML = html;
  afterRender(route, month);
  notice = '';
}

function rerenderKeepFocus() {
  // Re-rendering the whole page would drop the caret out of the search box,
  // so filter keystrokes only refresh the transaction table.
  const wrap = document.getElementById('tx-table-wrap');
  if (wrap) wrap.innerHTML = txTableHtml(currentMonth(), txFilter);
}

function flash(message) {
  notice = message;
  render();
  window.scrollTo({ top: 0 });
}

// ---- month switcher and reset --------------------------------------------

prevBtn.addEventListener('click', () => {
  const index = MONTHS.indexOf(currentMonth());
  if (index > 0) {
    setMonth(MONTHS[index - 1]);
    editingId = null;
    render();
  }
});

nextBtn.addEventListener('click', () => {
  const index = MONTHS.indexOf(currentMonth());
  if (index < MONTHS.length - 1) {
    setMonth(MONTHS[index + 1]);
    editingId = null;
    render();
  }
});

document.getElementById('reset-demo').addEventListener('click', () => {
  if (window.confirm('Reset all data back to the sample household figures? Your changes will be lost.')) {
    resetState();
    txFilter = { query: '', category: 'all', kind: 'all' };
    editingId = null;
    flash('Demo data reset — the sample Hartono household figures are back.');
  }
});

// ---- routing ---------------------------------------------------------------

window.addEventListener('hashchange', () => {
  if (currentRoute() !== 'transactions') {
    txFilter = { query: '', category: 'all', kind: 'all' };
    editingId = null;
  }
  render();
});

// ---- delegated clicks ------------------------------------------------------

viewEl.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  const id = target.dataset.id;

  if (action === 'toggle-bill') {
    toggleBillPaid(id, currentMonth());
    render();
  }
  if (action === 'delete-tx') {
    const tx = getState().transactions.find((item) => item.id === id);
    if (tx && window.confirm('Delete "' + tx.description + '" (' + fmtMoney(Math.abs(tx.amount)) + ')?')) {
      deleteTransaction(id);
      if (editingId === id) editingId = null;
      flash('Transaction deleted.');
    }
  }
  if (action === 'edit-tx') {
    editingId = id;
    render();
    const desc = document.getElementById('tx-desc');
    if (desc) desc.focus();
  }
  if (action === 'cancel-edit') {
    editingId = null;
    render();
  }
});

// ---- delegated input (transaction filters) ---------------------------------

viewEl.addEventListener('input', (event) => {
  if (event.target.id === 'tx-search') {
    txFilter.query = event.target.value;
    rerenderKeepFocus();
  }
});

viewEl.addEventListener('change', (event) => {
  if (event.target.id === 'tx-cat-filter') {
    txFilter.category = event.target.value;
    rerenderKeepFocus();
  }
  if (event.target.id === 'tx-kind-filter') {
    txFilter.kind = event.target.value;
    rerenderKeepFocus();
  }
});

// ---- delegated submits -----------------------------------------------------

viewEl.addEventListener('submit', (event) => {
  const form = event.target;
  event.preventDefault();
  const data = new FormData(form);

  if (form.id === 'tx-form') {
    const amount = Math.abs(Number(data.get('amount')));
    const signed = data.get('kind') === 'income' ? amount : -amount;
    const fields = {
      date: String(data.get('date')),
      description: String(data.get('description')),
      category: String(data.get('category')),
      amount: signed,
      note: String(data.get('note') || ''),
    };
    const editId = form.dataset.editing;
    if (editId) {
      updateTransaction(editId, fields);
      editingId = null;
      flash('Transaction updated.');
    } else {
      addTransaction(fields);
      flash('Transaction added — the totals and charts already include it.');
    }
    return;
  }

  if (form.classList.contains('budget-set')) {
    setBudget(form.dataset.category, Number(data.get('amount')));
    flash('Budget for ' + form.dataset.category + ' set to ' + fmtMoney(Number(data.get('amount'))) + ' a month.');
    return;
  }

  if (form.id === 'bill-form') {
    addBill({
      name: String(data.get('name')),
      amount: Number(data.get('amount')),
      dueDay: Number(data.get('dueDay')),
      category: String(data.get('category')),
      detail: String(data.get('detail') || ''),
    });
    flash('Bill added — it now appears in the list and on the dashboard.');
    return;
  }

  if (form.classList.contains('goal-funds')) {
    const goal = addGoalFunds(form.dataset.id, Number(data.get('amount')));
    if (goal) flash(fmtMoney(Number(data.get('amount'))) + ' added to ' + goal.name + ' — ' + fmtMoney(goal.saved) + ' of ' + fmtMoney(goal.target) + ' saved.');
    return;
  }

  if (form.classList.contains('goal-target')) {
    const goal = setGoalTarget(form.dataset.id, Number(data.get('target')));
    if (goal) flash('Target for ' + goal.name + ' updated to ' + fmtMoney(goal.target) + '.');
    return;
  }

  if (form.id === 'goal-form') {
    addGoal({
      name: String(data.get('name')),
      target: Number(data.get('target')),
      saved: 0,
      note: String(data.get('note') || ''),
    });
    flash('Goal added — start adding funds whenever there is some to spare.');
  }
});

render();
