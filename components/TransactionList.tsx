import React from 'react';
import { Transaction, Category } from '../types';
import { Trash2, Calendar, ShoppingCart, Tag } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  category: Category;
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, category, onDelete }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  // Sort by date descending
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-600">
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
          <Calendar size={24} />
        </div>
        <p>Nenhum registro encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card for List View */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center shadow-lg shadow-black/20">
        <div className="text-center w-full">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
            {category === 'pagamentos' ? 'Total Recebido' : 'Total Gasto'}
          </p>
          <p className={`text-2xl font-bold mt-1 ${category === 'pagamentos' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(sortedTransactions.reduce((acc, t) => acc + t.total, 0))}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sortedTransactions.map((item) => (
          <div key={item.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex justify-between items-start group hover:border-slate-700 transition-colors relative overflow-hidden">
            {/* Color Indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.type === 'compra' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

            <div className="pl-3 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {formatDate(item.date)}
                </span>
                
                {/* Specific tags for Repastilhamento */}
                {category === 'repast' && item.type === 'compra' && (
                  <div className="flex gap-1">
                    {(item.z ?? 0) > 48 ? (
                         <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                           Destopadeira ({item.z}Z)
                         </span>
                    ) : (
                        item.z && (
                            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              Z: {item.z}
                            </span>
                        )
                    )}
                    {item.corte && (
                       <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                         Corte: {item.corte}
                       </span>
                    )}
                  </div>
                )}

                {/* Specific tags for Serra Fita */}
                {category === 'serra' && item.type === 'compra' && item.length && (
                   <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                     {item.length}m
                   </span>
                )}
                
                {/* Specific tags for Novos */}
                {category === 'novos' && item.suggestedPrice && item.suggestedPrice > 0 && (
                   <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                     Venda: {formatCurrency(item.suggestedPrice)}
                   </span>
                )}
              </div>
              
              <h4 className="font-semibold text-slate-200 text-base leading-tight mb-1">{item.desc}</h4>
              
              {item.type === 'compra' && (
                <div className="flex flex-col gap-1">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                       <ShoppingCart size={12} />
                       {item.qty} un. x {formatCurrency(item.unitPrice)}
                    </div>
                </div>
              )}
            </div>

            <div className="text-right flex flex-col items-end gap-2">
              <span className={`font-bold text-lg ${item.type === 'compra' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {item.type === 'compra' ? '-' : '+'} {formatCurrency(item.total)}
              </span>
              
              <button 
                onClick={() => onDelete(item.id)}
                className="text-slate-600 hover:text-rose-500 transition-colors p-2 -mr-2"
                aria-label="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};