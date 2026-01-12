import React, { useEffect, useRef, useState } from 'react';
import { Transaction, Category, Totals } from '../types';
import { TrendingDown, TrendingUp, Wallet, Filter, Scissors, Hammer, PackageOpen, Search, Clock } from 'lucide-react';
import Chart from 'chart.js/auto';

interface SummaryProps {
  transactions: Transaction[];
  allTransactions: Transaction[];
  totals: Totals;
  setTab: (tab: Category) => void;
  filterStart: string;
  setFilterStart: (date: string) => void;
  filterEnd: string;
  setFilterEnd: (date: string) => void;
}

export const Summary: React.FC<SummaryProps> = ({ 
  transactions, 
  allTransactions,
  totals, 
  setTab,
  filterStart,
  setFilterStart,
  filterEnd,
  setFilterEnd
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const getCategoryTotal = (cat: string) => {
    return transactions
      .filter(t => t.category === cat && t.type === 'compra')
      .reduce((acc, curr) => acc + curr.total, 0);
  };

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const serra = getCategoryTotal('serra');
      const repast = getCategoryTotal('repast');
      const novos = getCategoryTotal('novos');

      chartInstance.current = new Chart(chartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Serra Fita', 'Repastilhamento', 'Novos'],
          datasets: [{
            data: [serra, repast, novos],
            backgroundColor: ['#3b82f6', '#f59e0b', '#6366f1'],
            borderColor: '#0f172a',
            borderWidth: 4,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { 
              position: 'bottom', 
              labels: { 
                usePointStyle: true, 
                boxWidth: 8,
                color: '#94a3b8',
                font: { family: 'Inter', size: 12 }
              } 
            } 
          },
          cutout: '75%'
        }
      });
    }
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [transactions]);

  const categoryCards = [
    { id: 'serra', label: 'Serra Fita', icon: Scissors, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'repast', label: 'Repastilhamento', icon: Hammer, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'novos', label: 'Novos Produtos', icon: PackageOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  // Logic for search and recent items (uses allTransactions to ignore date filter for recent list unless searching)
  const displayList = React.useMemo(() => {
    let source = searchQuery ? allTransactions : allTransactions;
    
    // Sort descending
    source = [...source].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.timestamp - a.timestamp);

    if (searchQuery) {
        return source.filter(t => t.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    } else {
        return source.slice(0, 10);
    }
  }, [allTransactions, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      
      {/* Search Bar */}
      <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 flex items-center gap-2 px-4 shadow-lg">
        <Search size={20} className="text-slate-500" />
        <input 
            type="text" 
            placeholder="Pesquisar lançamento em todas as abas..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-slate-200 text-sm w-full outline-none h-10 placeholder:text-slate-600"
        />
        {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-xs text-slate-500 hover:text-slate-300">Limpar</button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
          <Filter size={16} /> Filtrar Período (Gráficos):
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="date" 
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 text-sm w-full outline-none focus:border-indigo-500"
          />
          <span className="self-center text-slate-600">até</span>
          <input 
            type="date" 
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 text-sm w-full outline-none focus:border-indigo-500"
          />
        </div>
        {(filterStart || filterEnd) && (
          <button onClick={() => { setFilterStart(''); setFilterEnd(''); }} className="text-xs text-indigo-400 hover:text-indigo-300">
            Limpar
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-rose-500/30 transition-all group">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compras</p>
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
              <TrendingDown size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-100">{formatCurrency(totals.compras)}</h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all group">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pagos</p>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-100">{formatCurrency(totals.pagamentos)}</h3>
        </div>

        <div className="relative p-6 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/10 group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-slate-900 opacity-90"></div>
          <div className="absolute right-0 top-0 p-6 opacity-10 text-white transform rotate-12 scale-150">
            <Wallet size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Saldo Líquido</p>
            <h3 className={`text-3xl font-bold ${totals.saldo < 0 ? 'text-rose-200' : 'text-white'}`}>
              {formatCurrency(totals.saldo)}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 lg:col-span-1 flex flex-col items-center">
          <h4 className="text-sm font-bold text-slate-400 mb-6 w-full text-center uppercase tracking-wide">Distribuição de Gastos</h4>
          <div className="w-full h-64 relative">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryCards.map((card) => {
             const total = getCategoryTotal(card.id);
             const percent = totals.compras > 0 ? (total / totals.compras) * 100 : 0;
             return (
              <div 
                key={card.id} 
                onClick={() => setTab(card.id as Category)}
                className="bg-slate-900 p-5 rounded-2xl border border-slate-800 cursor-pointer hover:bg-slate-800 transition-all active:scale-[0.98] group flex flex-col justify-between"
              >
                <div>
                    <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg} ${card.color}`}>
                        <card.icon size={20} />
                    </div>
                    <span className="text-xl font-bold text-slate-700 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                        {percent.toFixed(1)}%
                    </span>
                    </div>
                    <h4 className="font-bold text-slate-200 text-lg">{card.label}</h4>
                    <p className="text-xs text-slate-500 mt-1">Total: {formatCurrency(total)}</p>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-4 border border-slate-800">
                  <div 
                    className={`h-full rounded-full ${card.id === 'serra' ? 'bg-blue-500' : card.id === 'repast' ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
             );
          })}
        </div>
      </div>

      {/* Recent Transactions / Search Results */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-300 flex items-center gap-2">
                <Clock size={16} /> 
                {searchQuery ? 'Resultados da Pesquisa' : 'Últimos 10 Lançamentos'}
            </h3>
            {searchQuery && <span className="text-xs text-slate-500">{displayList.length} encontrados</span>}
        </div>
        <div className="divide-y divide-slate-800">
            {displayList.length === 0 ? (
                <div className="p-8 text-center text-slate-600 text-sm">Nenhum lançamento encontrado.</div>
            ) : (
                displayList.map(item => (
                    <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-1 h-10 rounded-full ${item.type === 'compra' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold mb-0.5">{formatDate(item.date)} • <span className="uppercase">{item.category}</span></p>
                                <p className="text-slate-200 font-medium text-sm">{item.desc}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className={`font-bold text-sm ${item.type === 'compra' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {item.type === 'compra' ? '-' : '+'} {formatCurrency(item.total)}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};