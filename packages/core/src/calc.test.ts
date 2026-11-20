import { describe, expect, test } from "bun:test";
import {
  balanceByAccount,
  cashflowByMonth,
  filterByRange,
  pnlByCategory,
  pnlByMonth,
} from "./calc";
import { accounts, categories, transactions } from "./seed";
import type { Transaction } from "./types";

const tx = (p: Partial<Transaction>): Transaction => ({
  id: "x",
  date: "2026-01-10",
  accountId: "bank",
  categoryId: "sales",
  amount: 100,
  type: "income",
  ...p,
});

describe("cashflowByMonth", () => {
  test("sums inflow/outflow and carries running balance", () => {
    const rows = cashflowByMonth(
      [
        tx({ amount: 1000 }),
        tx({ type: "expense", categoryId: "rent", amount: 400 }),
        tx({ date: "2026-02-01", amount: 200 }),
      ],
      50,
    );
    expect(rows).toEqual([
      { month: "2026-01", inflow: 1000, outflow: 400, net: 600, balance: 650 },
      { month: "2026-02", inflow: 200, outflow: 0, net: 200, balance: 850 },
    ]);
  });
});

describe("balanceByAccount", () => {
  test("applies opening balance and signed transactions", () => {
    const res = balanceByAccount(accounts, [
      tx({ amount: 100 }),
      tx({ type: "expense", amount: 30 }),
    ]);
    expect(res.find((r) => r.account.id === "bank")?.balance).toBe(20070);
    expect(res.find((r) => r.account.id === "cash")?.balance).toBe(1500);
  });
});

describe("pnlByMonth", () => {
  test("splits revenue, cogs, opex", () => {
    const [row] = pnlByMonth(
      [
        tx({ amount: 1000 }),
        tx({ type: "expense", categoryId: "materials", amount: 300 }),
        tx({ type: "expense", categoryId: "rent", amount: 200 }),
      ],
      categories,
    );
    expect(row).toEqual({
      month: "2026-01",
      revenue: 1000,
      cogs: 300,
      grossProfit: 700,
      opex: 200,
      netProfit: 500,
    });
  });
});

describe("pnlByCategory", () => {
  test("omits empty categories", () => {
    const res = pnlByCategory([tx({ amount: 5 })], categories);
    expect(res).toHaveLength(1);
    expect(res[0]?.category.id).toBe("sales");
  });
});

describe("filterByRange + seed", () => {
  test("seed covers 12 months and range filter is inclusive", () => {
    expect(new Set(transactions.map((t) => t.date.slice(0, 7))).size).toBe(12);
    const q1 = filterByRange(transactions, { from: "2026-01", to: "2026-03" });
    expect(new Set(q1.map((t) => t.date.slice(0, 7))).size).toBe(3);
  });
});
