# Hartono Household Budget

A household budget site for the Hartono family — plan the month, track every
dollar in and out, pay bills on time, and grow the family savings goals.
It runs entirely offline from its own static files, on a desktop and on a
phone, with no build step and no network requests.

[![Household Budget Site](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/Anonymus22/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/Anonymus22/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

## What it does

- **Dashboard** — income vs spending vs saved for the month, budget left, a
  spending-by-category donut chart, budget progress bars, upcoming bills and
  the latest transactions, all at a glance.
- **Transactions** — search and filter every entry, and add, edit or delete
  transactions (date, description, category, amount, note).
- **Budgets** — a monthly target per category with live progress bars; saving
  a new target updates every page at once.
- **Bills & recurring** — the fixed monthly payments with due days, paid /
  due / overdue status, mark-paid buttons, and an add-bill form.
- **Savings goals** — emergency fund, family holiday, laptop and kitchen
  renovation, each with a target, progress bar, add-funds and target controls,
  plus a form to start a new goal.
- **Reports** — income vs spending trend across October–December 2026, a
  month-by-month table, a category breakdown, and plain-language insights
  computed from the real figures.
- **Month switcher** — October, November and December 2026 sample data; every
  page follows the month you pick.
- Changes are saved in the browser (localStorage), so the household's edits
  survive a reload. A reset button restores the sample figures.

## Sample household

The Hartono family: Budi's $5,200 monthly salary, a $1,450 home loan, weekly
grocery shops, utilities, transport, dining and entertainment — about $3,667
of spending in November 2026, keeping $1,533 (29% of income). Groceries ran
$24 over its $650 budget that month, and the home insurance bill is overdue
by a day — both are real, fixable situations the site surfaces.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 (use `--port` for another port).

## Files

- `app/` — the site itself: `index.html`, `style.css`, and JavaScript split
  by job: `data.js` (sample household figures), `store.js` (state,
  persistence and summaries), `charts.js` (canvas donut and trend charts),
  `views.js` (the six pages) and `app.js` (router and wiring).
- `main.ts` — the hand-in program: copies `app/` and `screenshots/` to the
  output directory and writes `dossier.json` (Node 22, standard library only).
- `serve.ts` — the small static server above.
- `screenshots/` — four real renders of the site (see `shots.json`).
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Built for the make.fun bounty
[Make the best household budget site](https://make.fun/bounty/best-household-budget-site-20261126-1457).
