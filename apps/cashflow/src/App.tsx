import {
  accounts,
  balanceByAccount,
  cashflowByMonth,
  filterByRange,
  formatMoney,
  transactions,
} from "@demo/core";
import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MONTHS = [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort();

export function App() {
  const [from, setFrom] = useState(MONTHS[0] as string);
  const [to, setTo] = useState(MONTHS[MONTHS.length - 1] as string);
  const [accountId, setAccountId] = useState("all");

  const txs = useMemo(
    () =>
      filterByRange(transactions, { from, to }).filter(
        (t) => accountId === "all" || t.accountId === accountId,
      ),
    [from, to, accountId],
  );
  const opening = accounts
    .filter((a) => accountId === "all" || a.id === accountId)
    .reduce((s, a) => s + a.openingBalance, 0);
  const rows = useMemo(() => cashflowByMonth(txs, opening), [txs, opening]);
  const balances = balanceByAccount(accounts, transactions);
  const inflow = rows.reduce((s, r) => s + r.inflow, 0);
  const outflow = rows.reduce((s, r) => s + r.outflow, 0);

  return (
    <main>
      <h1>Cashflow dashboard</h1>
      <div className="filters">
        <select
          aria-label="From month"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        >
          {MONTHS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          aria-label="To month"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        >
          {MONTHS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          aria-label="Account"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="all">All accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="cards">
        <div className="card">
          <small>Total balance (all accounts)</small>
          <strong>
            {formatMoney(balances.reduce((s, b) => s + b.balance, 0))}
          </strong>
        </div>
        <div className="card">
          <small>Inflow</small>
          <strong>{formatMoney(inflow)}</strong>
        </div>
        <div className="card">
          <small>Outflow</small>
          <strong>{formatMoney(outflow)}</strong>
        </div>
        <div className="card">
          <small>Net</small>
          <strong className={inflow - outflow < 0 ? "neg" : ""}>
            {formatMoney(inflow - outflow)}
          </strong>
        </div>
      </div>

      <section className="panel">
        <h2>Balances by account</h2>
        <table>
          <tbody>
            {balances.map((b) => (
              <tr key={b.account.id}>
                <td>{b.account.name}</td>
                <td>{formatMoney(b.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel" style={{ height: 320 }}>
        <h2>Inflow / outflow and balance</h2>
        <ResponsiveContainer width="100%" height="90%">
          <ComposedChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v) => formatMoney(Number(v))} />
            <Legend />
            <Bar dataKey="inflow" fill="#2e9e6b" />
            <Bar dataKey="outflow" fill="#d9644a" />
            <Line dataKey="balance" stroke="#2f5fd0" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </section>

      <section className="panel">
        <h2>Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Account</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.accountId}</td>
                <td>{t.categoryId}</td>
                <td className={t.type === "expense" ? "neg" : ""}>
                  {t.type === "expense" ? "-" : ""}
                  {formatMoney(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
