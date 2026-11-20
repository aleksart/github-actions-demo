import {
  categories,
  filterByRange,
  formatMoney,
  pnlByCategory,
  pnlByMonth,
  transactions,
} from "@demo/core";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MONTHS = [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort();

export function App() {
  const [from, setFrom] = useState(MONTHS[0] as string);
  const [to, setTo] = useState(MONTHS[MONTHS.length - 1] as string);

  const txs = useMemo(
    () => filterByRange(transactions, { from, to }),
    [from, to],
  );
  const rows = useMemo(() => pnlByMonth(txs, categories), [txs]);
  const expenses = useMemo(
    () =>
      pnlByCategory(txs, categories)
        .filter((r) => r.category.kind !== "revenue")
        .map((r) => ({ name: r.category.name, total: r.total })),
    [txs],
  );
  const net = rows.reduce((s, r) => s + r.netProfit, 0);

  const lines: { label: string; key: keyof (typeof rows)[number] }[] = [
    { label: "Revenue", key: "revenue" },
    { label: "COGS", key: "cogs" },
    { label: "Gross profit", key: "grossProfit" },
    { label: "Operating expenses", key: "opex" },
    { label: "Net profit", key: "netProfit" },
  ];

  return (
    <main>
      <h1>P&amp;L dashboard</h1>
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
      </div>

      <div className="cards">
        <div className="card">
          <small>Revenue</small>
          <strong>
            {formatMoney(rows.reduce((s, r) => s + r.revenue, 0))}
          </strong>
        </div>
        <div className="card">
          <small>Gross profit</small>
          <strong>
            {formatMoney(rows.reduce((s, r) => s + r.grossProfit, 0))}
          </strong>
        </div>
        <div className="card">
          <small>Operating expenses</small>
          <strong>{formatMoney(rows.reduce((s, r) => s + r.opex, 0))}</strong>
        </div>
        <div className="card">
          <small>Net profit</small>
          <strong className={net < 0 ? "neg" : ""}>{formatMoney(net)}</strong>
        </div>
      </div>

      <section className="panel">
        <h2>P&amp;L by month</h2>
        <table>
          <thead>
            <tr>
              <th>Line</th>
              {rows.map((r) => (
                <th key={r.month}>{r.month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.key}>
                <td>{l.label}</td>
                {rows.map((r) => (
                  <td
                    key={r.month}
                    className={Number(r[l.key]) < 0 ? "neg" : ""}
                  >
                    {formatMoney(Number(r[l.key]))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel" style={{ height: 280 }}>
        <h2>Net profit trend</h2>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v) => formatMoney(Number(v))} />
            <Line dataKey="netProfit" stroke="#2f5fd0" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="panel" style={{ height: 280 }}>
        <h2>Expenses by category</h2>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={expenses}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => formatMoney(Number(v))} />
            <Bar dataKey="total" fill="#d9644a" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </main>
  );
}
