export type CategoryKind = "revenue" | "cogs" | "opex";

export interface Account {
  id: string;
  name: string;
  currency: "USD";
  openingBalance: number;
}

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
}

export interface Transaction {
  id: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  accountId: string;
  categoryId: string;
  /** Always positive; direction comes from the category kind. */
  amount: number;
  type: "income" | "expense";
}

export interface MonthRange {
  /** YYYY-MM, inclusive */
  from: string;
  to: string;
}
