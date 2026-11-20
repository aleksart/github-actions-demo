import type { Account, Category, MonthRange, Transaction } from "./types";

const month = (date: string) => date.slice(0, 7);
const signed = (t: Transaction) => (t.type === "income" ? t.amount : -t.amount);

export function filterByRange(
  txs: Transaction[],
  range?: MonthRange,
): Transaction[] {
  if (!range) return txs;
  return txs.filter(
    (t) => month(t.date) >= range.from && month(t.date) <= range.to,
  );
}

export interface CashflowRow {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
  /** Running balance at month end, starting from `openingBalance`. */
  balance: number;
}

export function cashflowByMonth(
  txs: Transaction[],
  openingBalance = 0,
): CashflowRow[] {
  const months = new Map<string, { inflow: number; outflow: number }>();
  for (const t of txs) {
    const row = months.get(month(t.date)) ?? { inflow: 0, outflow: 0 };
    if (t.type === "income") row.inflow += t.amount;
    else row.outflow += t.amount;
    months.set(month(t.date), row);
  }
  let balance = openingBalance;
  return [...months.keys()].sort().map((m) => {
    const { inflow, outflow } = months.get(m) as {
      inflow: number;
      outflow: number;
    };
    const net = inflow - outflow;
    balance += net;
    return { month: m, inflow, outflow, net, balance };
  });
}

export function balanceByAccount(
  accounts: Account[],
  txs: Transaction[],
): { account: Account; balance: number }[] {
  return accounts.map((account) => ({
    account,
    balance:
      account.openingBalance +
      txs
        .filter((t) => t.accountId === account.id)
        .reduce((sum, t) => sum + signed(t), 0),
  }));
}

export interface PnlRow {
  month: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  netProfit: number;
}

export function pnlByMonth(
  txs: Transaction[],
  categories: Category[],
): PnlRow[] {
  const kindOf = new Map(categories.map((c) => [c.id, c.kind]));
  const months = new Map<
    string,
    { revenue: number; cogs: number; opex: number }
  >();
  for (const t of txs) {
    const kind = kindOf.get(t.categoryId);
    if (!kind) continue;
    const row = months.get(month(t.date)) ?? { revenue: 0, cogs: 0, opex: 0 };
    row[kind] += t.amount;
    months.set(month(t.date), row);
  }
  return [...months.keys()].sort().map((m) => {
    const { revenue, cogs, opex } = months.get(m) as {
      revenue: number;
      cogs: number;
      opex: number;
    };
    const grossProfit = revenue - cogs;
    return {
      month: m,
      revenue,
      cogs,
      grossProfit,
      opex,
      netProfit: grossProfit - opex,
    };
  });
}

export function pnlByCategory(
  txs: Transaction[],
  categories: Category[],
): { category: Category; total: number }[] {
  return categories
    .map((category) => ({
      category,
      total: txs
        .filter((t) => t.categoryId === category.id)
        .reduce((s, t) => s + t.amount, 0),
    }))
    .filter((r) => r.total > 0);
}

export const formatMoney = (n: number): string =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
