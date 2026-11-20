import type { Account, Category, Transaction } from "./types";

export const accounts: Account[] = [
  {
    id: "bank",
    name: "Main bank account",
    currency: "USD",
    openingBalance: 20000,
  },
  { id: "cash", name: "Cash", currency: "USD", openingBalance: 1500 },
  { id: "card", name: "Corporate card", currency: "USD", openingBalance: 5000 },
];

export const categories: Category[] = [
  { id: "sales", name: "Sales", kind: "revenue" },
  { id: "services", name: "Services", kind: "revenue" },
  { id: "materials", name: "Materials", kind: "cogs" },
  { id: "salaries", name: "Salaries", kind: "opex" },
  { id: "rent", name: "Rent", kind: "opex" },
  { id: "marketing", name: "Marketing", kind: "opex" },
];

/** Deterministic pseudo-random generator so tests and screenshots are stable. */
function lcg(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildTransactions(): Transaction[] {
  const rnd = lcg(42);
  const out: Transaction[] = [];
  let n = 0;
  const add = (
    month: number,
    day: number,
    accountId: string,
    categoryId: string,
    type: Transaction["type"],
    amount: number,
  ) => {
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    n += 1;
    out.push({
      id: `t${n}`,
      date: `2026-${mm}-${dd}`,
      accountId,
      categoryId,
      type,
      amount: Math.round(amount),
    });
  };
  for (let m = 1; m <= 12; m++) {
    add(m, 5, "bank", "sales", "income", 9000 + rnd() * 4000);
    add(m, 12, "bank", "services", "income", 3000 + rnd() * 2000);
    add(m, 18, "cash", "sales", "income", 500 + rnd() * 700);
    add(m, 8, "bank", "materials", "expense", 2500 + rnd() * 1500);
    add(m, 1, "bank", "rent", "expense", 2000);
    add(m, 25, "bank", "salaries", "expense", 6500);
    add(m, 15, "card", "marketing", "expense", 400 + rnd() * 800);
  }
  return out;
}

export const transactions: Transaction[] = buildTransactions();
