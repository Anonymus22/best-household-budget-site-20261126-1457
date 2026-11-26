// views.js — one job: turn the store's state into the HTML of each page.
// Every page is a function of (month, extras); app.js mounts the result and
// then calls afterRender() so the canvases get drawn.

import {
  CATEGORIES,
  CATEGORY_COLORS,
  EXPENSE_CATEGORIES,
  MONTHS,
  MONTH_LABELS,
  esc,
  fmtDate,
  fmtMoney,
  fmtMoneySigned,
} from './data.js';
import { drawDonut, drawTrend } from './charts.js';
import {
  biggestExpense,
  billsDueCount,
  budgetStatus,
  getState,
  monthTotals,
  spentByCategory,
  totalBudget,
  totalSavedGoals,
  transactionsFor,
  upcomingBills,
} from './store.js';

function barClass(pct) {
  if (pct > 100) return 'over';
  if (pct >= 80) return 'amber';
  return '';
}

function budgetBarRow(item) {
  const leftText = item.left >= 0
    ? fmtMoney(item.left) + ' left'
    : fmtMoney(-item.left) + ' over budget';
  return '<div class="budget-row">'
    + '<div class="top"><b>' + esc(item.category) + '</b>'
    + '<span class="num">' + fmtMoney(item.used) + ' of ' + fmtMoney(item.budget) + '</span></div>'
    + '<div class="progress"><i class="' + barClass(item.pct) + '" style="width:' + Math.min(100, item.pct) + '%"></i></div>'
    + '<div class="under' + (item.left < 0 ? ' over' : '') + '">' + leftText + ' · ' + Math.round(item.pct) + '% used</div>'
    + '</div>';
}

function billRow(bill, month) {
  const status = bill.paid
    ? '<span class="pill paid">Paid</span>'
    : bill.overdue
      ? '<span class="pill overdue">Overdue</span>'
      : '<span class="pill due">Due ' + fmtDate(month + '-' + String(bill.dueDay).padStart(2, '0')) + '</span>';
  const action = bill.paid ? 'Mark unpaid' : 'Mark paid';
  return '<div class="bill-row">'
    + '<div class="info"><b>' + esc(bill.name) + '</b><span>' + esc(bill.detail) + ' · due day ' + bill.dueDay + '</span></div>'
    + '<span class="amt num">' + fmtMoney(bill.amount) + '</span>'
    + status
    + '<button type="button" class="btn ghost small" data-action="toggle-bill" data-id="' + bill.id + '">' + action + '</button>'
    + '</div>';
}

function txRow(tx) {
  const amountClass = tx.amount < 0 ? 'neg' : 'pos';
  return '<tr>'
    + '<td class="num">' + fmtDate(tx.date) + '</td>'
    + '<td><b>' + esc(tx.description) + '</b></td>'
    + '<td><span class="cat-chip">' + esc(tx.category) + '</span></td>'
    + '<td class="hide-m">' + esc(tx.note || '—') + '</td>'
    + '<td class="amount num ' + amountClass + '">' + fmtMoneySigned(tx.amount) + '</td>'
    + '<td class="row-actions">'
    + '<button type="button" class="link-btn" data-action="edit-tx" data-id="' + tx.id + '">Edit</button>'
    + '<button type="button" class="link-btn danger" data-action="delete-tx" data-id="' + tx.id + '">Delete</button>'
    + '</td>'
    + '</tr>';
}

export function txTableHtml(month, filter) {
  const all = transactionsFor(month);
  const query = (filter.query || '').trim().toLowerCase();
  const rows = all.filter((tx) => {
    if (filter.category && filter.category !== 'all' && tx.category !== filter.category) return false;
    if (filter.kind === 'expense' && tx.amount >= 0) return false;
    if (filter.kind === 'income' && tx.amount < 0) return false;
    if (query && !(tx.description + ' ' + (tx.note || '') + ' ' + tx.category).toLowerCase().includes(query)) return false;
    return true;
  });
  if (!rows.length) {
    return '<p class="empty">No transactions match these filters. Try clearing the search or choosing another category.</p>';
  }
  return '<table><thead><tr>'
    + '<th>Date</th><th>Description</th><th>Category</th><th class="hide-m">Note</th>'
    + '<th class="amount">Amount</th><th></th>'
    + '</tr></thead><tbody>'
    + rows.map(txRow).join('')
    + '</tbody></table>';
}

function categoryOptions(selected) {
  return CATEGORIES.map((cat) => '<option value="' + cat + '"' + (cat === selected ? ' selected' : '') + '>' + cat + '</option>').join('');
}

function txFormHtml(month, editing) {
  const isEdit = Boolean(editing);
  const d = editing || { date: month + '-26', description: '', category: 'Groceries', amount: '', note: '' };
  const amount = editing ? Math.abs(editing.amount) : '';
  const kind = editing ? (editing.amount < 0 ? 'expense' : 'income') : 'expense';
  return '<div class="card"><h3>' + (isEdit ? 'Edit transaction' : 'Add a transaction') + '</h3>'
    + '<p class="sub">' + (isEdit
      ? 'Change any field and save — the totals, charts and budgets update at once.'
      : 'Record money in or out. It appears in the list below and in every total on the site.') + '</p>'
    + '<form class="inline-form" id="tx-form" data-editing="' + (editing ? editing.id : '') + '">'
    + '<div class="form-row">'
    + '<div><label for="tx-date">Date</label><input id="tx-date" name="date" type="date" required value="' + d.date + '" min="2026-10-01" max="2026-12-31"></div>'
    + '<div><label for="tx-kind">Type</label><select id="tx-kind" name="kind">'
    + '<option value="expense"' + (kind === 'expense' ? ' selected' : '') + '>Expense</option>'
    + '<option value="income"' + (kind === 'income' ? ' selected' : '') + '>Income</option>'
    + '</select></div>'
    + '</div>'
    + '<div class="form-row">'
    + '<div><label for="tx-desc">Description</label><input id="tx-desc" name="description" type="text" required maxlength="80" placeholder="e.g. GreenMart weekly shop" value="' + esc(d.description) + '"></div>'
    + '<div><label for="tx-amount">Amount ($)</label><input id="tx-amount" name="amount" type="number" required min="0.01" step="0.01" placeholder="0.00" value="' + amount + '"></div>'
    + '</div>'
    + '<div class="form-row">'
    + '<div><label for="tx-cat">Category</label><select id="tx-cat" name="category">' + categoryOptions(d.category) + '</select></div>'
    + '<div><label for="tx-note">Note (optional)</label><input id="tx-note" name="note" type="text" maxlength="120" placeholder="What was this for?" value="' + esc(d.note || '') + '"></div>'
    + '</div>'
    + '<div><button class="btn" type="submit">' + (isEdit ? 'Save changes' : 'Add transaction') + '</button> '
    + (isEdit ? '<button class="btn ghost" type="button" data-action="cancel-edit">Cancel</button>' : '')
    + '</div>'
    + '</form></div>';
}

// ---- pages ---------------------------------------------------------------

export function renderDashboard(month) {
  const totals = monthTotals(month);
  const label = MONTH_LABELS[month];
  const spent = spentByCategory(month);
  const status = budgetStatus(month);
  const budgetTotal = totalBudget();
  const budgetLeft = budgetTotal - totals.spending;
  const usedPct = budgetTotal > 0 ? (totals.spending / budgetTotal) * 100 : 0;
  const savingsRate = totals.income > 0 ? Math.round(((totals.income - totals.spending) / totals.income) * 100) : 0;
  const spentCats = Object.keys(spent).filter((cat) => spent[cat] > 0).length;
  const bills = upcomingBills(month);
  const unpaid = bills.filter((bill) => !bill.paid);
  const recent = transactionsFor(month).slice(0, 6);

  const statCards = '<div class="stat-row">'
    + '<div class="stat"><div class="label">Income · ' + label + '</div><div class="value num">' + fmtMoney(totals.income) + '</div><div class="note">Salary and other money in</div></div>'
    + '<div class="stat"><div class="label">Spending · ' + label + '</div><div class="value num">' + fmtMoney(totals.spending) + '</div><div class="note">Across ' + spentCats + ' categories</div></div>'
    + '<div class="stat good"><div class="label">Saved · ' + label + '</div><div class="value num">' + fmtMoney(totals.saved) + '</div><div class="note">' + savingsRate + '% of income kept</div></div>'
    + '<div class="stat' + (budgetLeft < 0 ? ' warn' : '') + '"><div class="label">Budget left</div><div class="value num">' + fmtMoney(Math.max(0, budgetLeft)) + '</div><div class="bar"><i class="' + (usedPct > 100 ? 'over' : '') + '" style="width:' + Math.min(100, usedPct) + '%"></i></div><div class="note">' + fmtMoney(totals.spending) + ' of ' + fmtMoney(budgetTotal) + ' planned</div></div>'
    + '</div>';

  const donutCard = '<div class="card"><h3>Where the money went</h3>'
    + '<p class="sub">Spending by category in ' + label + '. The biggest slice is housing, as it should be.</p>'
    + '<div class="split"><div class="donut-wrap"><canvas id="donut" width="260" height="260" role="img" aria-label="Donut chart of spending by category"></canvas></div>'
    + '<ul class="legend" id="donut-legend"></ul></div></div>';

  const recentCard = '<div class="card mt"><h3>Recent transactions</h3>'
    + '<p class="sub">The latest money in and out for ' + label + '.</p>'
    + '<table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="amount">Amount</th></tr></thead><tbody>'
    + recent.map((tx) => '<tr><td class="num">' + fmtDate(tx.date) + '</td><td><b>' + esc(tx.description) + '</b></td><td><span class="cat-chip">' + esc(tx.category) + '</span></td><td class="amount num ' + (tx.amount < 0 ? 'neg' : 'pos') + '">' + fmtMoneySigned(tx.amount) + '</td></tr>').join('')
    + '</tbody></table>'
    + '<p class="hint" style="margin-top:10px"><a href="#/transactions">See all transactions &rarr;</a></p></div>';

  const overCats = status.filter((item) => item.left < 0);
  const budgetNote = overCats.length
    ? overCats.map((item) => item.category).join(' and ') + ' over budget — trim a little next week to get back on plan.'
    : 'Every category is inside its budget.';
  const budgetCard = '<div class="card"><h3>Budgets this month</h3>'
    + '<p class="sub">' + fmtMoney(budgetLeft) + ' left of the ' + fmtMoney(budgetTotal) + ' plan. ' + budgetNote + '</p>'
    + status.map(budgetBarRow).join('')
    + '<p class="hint" style="margin-top:10px"><a href="#/budgets">Adjust budgets &rarr;</a></p></div>';

  const billsCard = '<div class="card mt"><h3>Upcoming bills</h3>'
    + '<p class="sub">' + unpaid.length + ' of ' + bills.length + ' bills still to pay in ' + label + '.</p>'
    + bills.slice(0, 5).map((bill) => billRow(bill, month)).join('')
    + '<p class="hint" style="margin-top:10px"><a href="#/bills">All bills &amp; recurring &rarr;</a></p></div>';

  const goals = totalSavedGoals();
  const goalsList = getState().goals.slice().sort((a, b) => b.saved - a.saved);
  const topGoal = goalsList[0];
  const nextGoal = goalsList[1];
  const topPct = topGoal ? Math.round((topGoal.saved / topGoal.target) * 100) : 0;
  const nextPct = nextGoal ? Math.round((nextGoal.saved / nextGoal.target) * 100) : 0;
  const goalsCard = '<div class="card mt"><h3>Savings goals</h3>'
    + '<p class="sub">' + fmtMoney(goals) + ' saved across the family goals so far.</p>'
    + '<p style="font-size:15px">' + esc(topGoal.name) + ' leads the way at <b>' + fmtMoney(topGoal.saved) + ' of ' + fmtMoney(topGoal.target) + '</b> — ' + topPct + '% there. ' + esc(nextGoal.name) + ' is next at <b>' + fmtMoney(nextGoal.saved) + ' of ' + fmtMoney(nextGoal.target) + '</b> — ' + nextPct + '%.</p>'
    + '<p class="hint" style="margin-top:10px"><a href="#/goals">Add to a goal &rarr;</a></p></div>';

  return '<div class="page-head"><h2>Good evening, Hartono family</h2>'
    + '<p>Here is ' + label + ' at a glance: what came in, what went out, what is left, and which bills still need paying.</p></div>'
    + statCards
    + '<div class="dash-grid"><div>' + donutCard + recentCard + '</div>'
    + '<div>' + budgetCard + billsCard + goalsCard + '</div></div>';
}

export function renderTransactions(month, filter, editing) {
  const totals = monthTotals(month);
  const count = transactionsFor(month).length;
  return '<div class="page-head"><h2>Transactions</h2>'
    + '<p>Every dollar in and out for ' + MONTH_LABELS[month] + ' — ' + count + ' entries, ' + fmtMoney(totals.income) + ' in and ' + fmtMoney(totals.spending) + ' out. Search, filter, add, edit or delete.</p></div>'
    + txFormHtml(month, editing)
    + '<div class="card mt"><h3>All transactions</h3>'
    + '<div class="filters">'
    + '<div class="field grow"><label for="tx-search">Search</label><input id="tx-search" type="search" placeholder="Search description or note…" value="' + esc(filter.query || '') + '"></div>'
    + '<div class="field"><label for="tx-cat-filter">Category</label><select id="tx-cat-filter"><option value="all">All categories</option>'
    + CATEGORIES.map((cat) => '<option value="' + cat + '"' + (filter.category === cat ? ' selected' : '') + '>' + cat + '</option>').join('')
    + '</select></div>'
    + '<div class="field"><label for="tx-kind-filter">Type</label><select id="tx-kind-filter">'
    + '<option value="all"' + (filter.kind === 'all' ? ' selected' : '') + '>Income &amp; expense</option>'
    + '<option value="expense"' + (filter.kind === 'expense' ? ' selected' : '') + '>Expense only</option>'
    + '<option value="income"' + (filter.kind === 'income' ? ' selected' : '') + '>Income only</option>'
    + '</select></div>'
    + '</div>'
    + '<div id="tx-table-wrap">' + txTableHtml(month, filter) + '</div>'
    + '</div>';
}

export function renderBudgets(month) {
  const status = budgetStatus(month);
  const totals = monthTotals(month);
  const budgetTotal = totalBudget();
  const left = budgetTotal - totals.spending;
  const over = status.filter((item) => item.left < 0);
  const summary = over.length
    ? over.map((item) => item.category).join(' and ') + (over.length > 1 ? ' are' : ' is') + ' over budget this month — trim a little next week to get back on plan.'
    : 'Every category is inside its budget this month. Well done — the plan is working.';
  return '<div class="page-head"><h2>Budgets</h2>'
    + '<p>One monthly target per category for the whole household. Set a number, save it, and the progress bars everywhere on the site follow it.</p></div>'
    + '<div class="card"><h3>' + MONTH_LABELS[month] + ' plan: ' + fmtMoney(budgetTotal) + '</h3>'
    + '<p class="sub">' + fmtMoney(totals.spending) + ' spent so far · ' + fmtMoney(left) + ' left · ' + summary + '</p>'
    + '<div class="grid-2">'
    + status.map((item) => '<div class="budget-row"><div class="top"><b>' + esc(item.category) + '</b>'
      + '<span class="num">' + fmtMoney(item.used) + ' of ' + fmtMoney(item.budget) + '</span></div>'
      + '<div class="progress"><i class="' + barClass(item.pct) + '" style="width:' + Math.min(100, item.pct) + '%"></i></div>'
      + '<div class="under' + (item.left < 0 ? ' over' : '') + '">' + (item.left >= 0 ? fmtMoney(item.left) + ' left' : fmtMoney(-item.left) + ' over budget') + ' · ' + Math.round(item.pct) + '% used</div>'
      + '<form class="budget-set" data-category="' + esc(item.category) + '" style="display:flex;gap:8px;margin-top:9px">'
      + '<label class="hint" for="budget-' + esc(item.category) + '" style="align-self:center;margin:0">Monthly budget</label>'
      + '<input id="budget-' + esc(item.category) + '" name="amount" type="number" min="0" step="1" required value="' + item.budget + '" style="max-width:120px">'
      + '<button class="btn ghost small" type="submit">Save</button>'
      + '</form></div>').join('')
    + '</div></div>'
    + '<div class="card mt"><h3>How the Hartonos set a budget</h3>'
    + '<p style="font-size:15px">Start from last month&rsquo;s real spending, not a wish. Housing and utilities are fixed, so they get what they cost. Groceries and dining are the flexible ones — that is where a smaller target actually saves money. Savings is budgeted first, like a bill, before anything fun.</p></div>';
}

export function renderBills(month) {
  const bills = upcomingBills(month);
  const unpaid = bills.filter((bill) => !bill.paid);
  const dueTotal = unpaid.reduce((sum, bill) => sum + bill.amount, 0);
  const overdue = unpaid.filter((bill) => bill.overdue);
  return '<div class="page-head"><h2>Bills &amp; recurring</h2>'
    + '<p>The fixed payments that repeat every month. Mark each one paid as it goes out, so nothing slips past its due date.</p></div>'
    + '<div class="stat-row" style="grid-template-columns:repeat(3,1fr)">'
    + '<div class="stat"><div class="label">Paid in ' + MONTH_LABELS[month] + '</div><div class="value num">' + (bills.length - unpaid.length) + ' of ' + bills.length + '</div><div class="note">bills settled</div></div>'
    + '<div class="stat' + (overdue.length ? ' warn' : '') + '"><div class="label">Still to pay</div><div class="value num">' + fmtMoney(dueTotal) + '</div><div class="note">' + unpaid.length + ' bills outstanding</div></div>'
    + '<div class="stat"><div class="label">Overdue</div><div class="value num">' + overdue.length + '</div><div class="note">' + (overdue.length ? overdue.map((bill) => esc(bill.name)).join(', ') + ' need' + (overdue.length > 1 ? '' : 's') + ' paying now' : 'nothing overdue — nice') + '</div></div>'
    + '</div>'
    + '<div class="card"><h3>All recurring bills</h3>'
    + '<p class="sub">Sorted by due day. Tap &ldquo;Mark paid&rdquo; when the money leaves the account.</p>'
    + bills.map((bill) => billRow(bill, month)).join('')
    + '</div>'
    + '<div class="card mt"><h3>Add a recurring bill</h3>'
    + '<p class="sub">A payment that repeats every month — rent, a subscription, insurance.</p>'
    + '<form class="inline-form" id="bill-form"><div class="form-row">'
    + '<div><label for="bill-name">Bill name</label><input id="bill-name" name="name" type="text" required maxlength="60" placeholder="e.g. Water filter service"></div>'
    + '<div><label for="bill-amount">Amount ($ per month)</label><input id="bill-amount" name="amount" type="number" required min="0.01" step="0.01" placeholder="0.00"></div>'
    + '</div><div class="form-row">'
    + '<div><label for="bill-day">Due day of month</label><input id="bill-day" name="dueDay" type="number" required min="1" max="28" value="15"></div>'
    + '<div><label for="bill-cat">Category</label><select id="bill-cat" name="category">' + EXPENSE_CATEGORIES.map((cat) => '<option>' + cat + '</option>').join('') + '</select></div>'
    + '</div><div><label for="bill-detail">Detail (optional)</label><input id="bill-detail" name="detail" type="text" maxlength="100" placeholder="e.g. Quarterly service, billed monthly"></div>'
    + '<div><button class="btn" type="submit">Add bill</button></div></form></div>';
}

export function renderGoals(month) {
  const goals = getState().goals;
  const totalSaved = totalSavedGoals();
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const pct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  return '<div class="page-head"><h2>Savings goals</h2>'
    + '<p>What the family is saving for, and how close each goal is. Add money whenever there is some to spare — small amounts count.</p></div>'
    + '<div class="stat-row" style="grid-template-columns:repeat(3,1fr)">'
    + '<div class="stat good"><div class="label">Saved across all goals</div><div class="value num">' + fmtMoney(totalSaved) + '</div><div class="note">of ' + fmtMoney(totalTarget) + ' targeted</div></div>'
    + '<div class="stat"><div class="label">Overall progress</div><div class="value num">' + pct + '%</div><div class="bar"><i style="width:' + pct + '%"></i></div><div class="note">' + goals.length + ' goals on the go</div></div>'
    + '<div class="stat"><div class="label">Saved in ' + MONTH_LABELS[month] + '</div><div class="value num">' + fmtMoney(spentByCategory(month).Savings || 0) + '</div><div class="note">monthly savings transfer</div></div>'
    + '</div>'
    + '<div class="grid-2">'
    + goals.map((goal) => {
      const goalPct = goal.target > 0 ? Math.round((goal.saved / goal.target) * 100) : 0;
      return '<div class="card goal-card"><div class="goal-top"><b>' + esc(goal.name) + '</b><span>' + goalPct + '% funded</span></div>'
        + '<p class="hint">' + esc(goal.note) + '</p>'
        + '<div class="big num">' + fmtMoney(goal.saved) + ' <small>of ' + fmtMoney(goal.target) + '</small></div>'
        + '<div class="progress"><i style="width:' + Math.min(100, goalPct) + '%;background:' + goal.color + '"></i></div>'
        + '<div class="pct-line">' + fmtMoney(Math.max(0, goal.target - goal.saved)) + ' still to save</div>'
        + '<form class="goal-funds" data-id="' + goal.id + '"><input name="amount" type="number" required min="1" step="1" placeholder="Add $…" aria-label="Amount to add to ' + esc(goal.name) + '"><button class="btn amber small" type="submit">Add funds</button></form>'
        + '<form class="goal-target" data-id="' + goal.id + '" style="display:flex;gap:8px"><input name="target" type="number" required min="1" step="1" value="' + goal.target + '" aria-label="Target for ' + esc(goal.name) + '" style="max-width:140px"><button class="btn ghost small" type="submit">Update target</button></form>'
        + '</div>';
    }).join('')
    + '</div>'
    + '<div class="card mt"><h3>Start a new goal</h3>'
    + '<p class="sub">Give the saving a name and a target — a named goal gets saved for twice as fast as &ldquo;general savings&rdquo;.</p>'
    + '<form class="inline-form" id="goal-form"><div class="form-row">'
    + '<div><label for="goal-name">Goal name</label><input id="goal-name" name="name" type="text" required maxlength="60" placeholder="e.g. New washing machine"></div>'
    + '<div><label for="goal-target-new">Target ($)</label><input id="goal-target-new" name="target" type="number" required min="1" step="1" placeholder="1000"></div>'
    + '</div><div><label for="goal-note">What is it for? (optional)</label><input id="goal-note" name="note" type="text" maxlength="120" placeholder="e.g. The old one leaks"></div>'
    + '<div><button class="btn" type="submit">Add goal</button></div></form></div>';
}

export function renderReports(month) {
  const totals = monthTotals(month);
  const spent = spentByCategory(month);
  const daysInMonth = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
  const avgDay = totals.spending / daysInMonth;
  const biggest = biggestExpense(month);
  const status = budgetStatus(month);
  const over = status.filter((item) => item.left < 0);
  const topCat = status.slice().sort((a, b) => b.used - a.used)[0];
  const savingsRate = totals.income > 0 ? Math.round(((totals.income - totals.spending) / totals.income) * 100) : 0;

  const monthRows = MONTHS.map((m) => {
    const t = monthTotals(m);
    const rate = t.income > 0 ? Math.round(((t.income - t.spending) / t.income) * 100) : 0;
    return '<tr><td><b>' + MONTH_LABELS[m] + '</b></td><td class="amount num pos">' + fmtMoney(t.income) + '</td><td class="amount num">' + fmtMoney(t.spending) + '</td><td class="amount num ' + (t.saved >= 0 ? 'pos' : 'neg') + '">' + fmtMoneySigned(t.saved) + '</td><td class="amount num">' + rate + '%</td></tr>';
  }).join('');

  const maxSpent = Math.max(1, ...Object.values(spent));
  const breakdown = EXPENSE_CATEGORIES
    .filter((cat) => spent[cat] > 0)
    .sort((a, b) => spent[b] - spent[a])
    .map((cat) => '<div class="hbar-row"><span>' + esc(cat) + '</span>'
      + '<span class="hbar"><i style="width:' + Math.round((spent[cat] / maxSpent) * 100) + '%;background:' + CATEGORY_COLORS[cat] + '"></i></span>'
      + '<span class="amt num">' + fmtMoney(spent[cat]) + '</span></div>').join('');

  const insights = [];
  insights.push('<b>' + esc(topCat.category) + '</b> is the biggest cost in ' + MONTH_LABELS[month] + ' at <b>' + fmtMoney(topCat.used) + '</b> — ' + Math.round((topCat.used / Math.max(1, totals.spending)) * 100) + '% of all spending.');
  if (biggest) insights.push('The biggest single expense was <b>' + esc(biggest.description) + '</b> at <b>' + fmtMoney(-biggest.amount) + '</b> on ' + fmtDate(biggest.date) + '.');
  insights.push('The household spends about <b>' + fmtMoney(Math.round(avgDay)) + ' a day</b> on average in ' + MONTH_LABELS[month] + '.');
  insights.push(savingsRate >= 20
    ? 'You kept <b>' + savingsRate + '% of income</b> — above the 20% guideline. That is a strong month.'
    : 'You kept <b>' + savingsRate + '% of income</b> — under the 20% guideline. Dining and entertainment are the easiest places to find it.');
  if (over.length) {
    insights.push(over.map((item) => '<b>' + esc(item.category) + '</b> ran <b>' + fmtMoney(-item.left) + '</b> over its ' + fmtMoney(item.budget) + ' budget').join(' ') + ' — a smaller weekly shop next week covers it.');
  } else {
    insights.push('No category went over budget in ' + MONTH_LABELS[month] + ' — the plan held.');
  }
  const bestMonth = MONTHS.map((m) => ({ m, saved: monthTotals(m).saved }))
    .sort((a, b) => b.saved - a.saved)[0];
  insights.push('<b>' + MONTH_LABELS[bestMonth.m] + '</b> is the best saving month so far, keeping <b>' + fmtMoney(bestMonth.saved) + '</b>.');

  return '<div class="page-head"><h2>Reports</h2>'
    + '<p>Three months side by side, so the household can see the trend — not just one good or bad week.</p></div>'
    + '<div class="card"><h3>Income vs spending — Oct to Dec 2026</h3>'
    + '<p class="sub">Green is money in, amber is money out. The gap between them is what the family keeps.</p>'
    + '<div class="trend-wrap"><canvas id="trend" width="640" height="300" role="img" aria-label="Bar chart of income versus spending for October, November and December 2026"></canvas></div></div>'
    + '<div class="dash-grid mt"><div class="card"><h3>Month by month</h3>'
    + '<p class="sub">Income, spending, what was kept, and the savings rate.</p>'
    + '<table><thead><tr><th>Month</th><th class="amount">Income</th><th class="amount">Spending</th><th class="amount">Saved</th><th class="amount">Rate</th></tr></thead><tbody>'
    + monthRows + '</tbody></table></div>'
    + '<div class="card"><h3>Where November&rsquo;s money went</h3>'
    + '<p class="sub">Spending by category in ' + MONTH_LABELS[month] + '.</p>'
    + breakdown + '</div></div>'
    + '<div class="card mt"><h3>What the numbers say</h3>'
    + '<p class="sub">Plain-language takeaways from ' + MONTH_LABELS[month] + '.</p>'
    + insights.map((text, i) => '<div class="insight"><span class="mark">' + (i + 1) + '</span><p>' + text + '</p></div>').join('')
    + '</div>';
}

// ---- after the HTML is in the page ---------------------------------------

// Draws the charts for the current route.
export function afterRender(route, month) {
  if (route === 'dashboard') {
    const canvas = document.getElementById('donut');
    const legend = document.getElementById('donut-legend');
    if (!canvas || !legend) return;
    const spent = spentByCategory(month);
    const entries = EXPENSE_CATEGORIES
      .filter((cat) => spent[cat] > 0)
      .sort((a, b) => spent[b] - spent[a])
      .map((cat) => ({ label: cat, value: spent[cat], color: CATEGORY_COLORS[cat] }));
    const total = entries.reduce((sum, entry) => sum + entry.value, 0);
    drawDonut(canvas, entries, total);
    legend.innerHTML = entries.map((entry) => '<li><span class="dot" style="background:' + entry.color + '"></span>'
      + '<span class="cat">' + esc(entry.label) + '</span>'
      + '<span class="amt num">' + fmtMoney(entry.value) + '</span>'
      + '<span class="pct num">' + Math.round((entry.value / total) * 100) + '%</span></li>').join('');
  }
  if (route === 'reports') {
    const canvas = document.getElementById('trend');
    if (!canvas) return;
    const months = MONTHS.map((m) => {
      const t = monthTotals(m);
      return { label: MONTH_LABELS[m].split(' ')[0], income: t.income, spending: t.spending };
    });
    drawTrend(canvas, months);
  }
}
