
export type TransactionType = 'compra' | 'pagamento';
export type Category = 'resumo' | 'serra' | 'repast' | 'novos' | 'pagamentos';

export interface Transaction {
  id: string;
  category: string;
  date: string;
  desc: string;
  type: TransactionType;
  qty: number;
  unitPrice: number;
  total: number;
  z?: number;
  corte?: number;
  serraItem?: string;
  length?: number;
  suggestedPrice?: number;
  timestamp: number;
}

export interface Totals {
  compras: number;
  pagamentos: number;
  saldo: number;
}

export interface FormState {
  type: TransactionType;
  date: string;
  desc: string;
  qty: string | number;
  unitPrice: string | number;
  totalOverride: string | number;
  z: string | number;
  corte: string | number;
  serraItem: string;
  length: string | number;
  suggestedPrice: string | number;
}
