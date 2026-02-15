
export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
}

export type TransactionType = 'credit' | 'payment';

export interface Transaction {
  id: string;
  user_id: string;
  client_id: string;
  amount: number;
  type: TransactionType;
  created_at: string;
}

export interface ClientBalance extends Client {
  total_credit: number;
  total_payment: number;
  balance: number;
}
