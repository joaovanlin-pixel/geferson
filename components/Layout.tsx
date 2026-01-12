import React from 'react';
import { Category } from '../types';
import { 
  PieChart, 
  Scissors, 
  Hammer, 
  PackageOpen, 
  Banknote, 
  LogOut, 
  Menu,
  Plus,
  Minus,
  MessageCircle
} from 'lucide-react';

interface SidebarProps {
  currentTab: Category;
  setTab: (tab: Category) => void;
  logout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab, logout }) => {
  const menuItems: { id: Category; label: string; icon: React.ElementType }[] = [
    { id: 'resumo', label: 'Visão Geral', icon: PieChart },
    { id: 'serra', label: 'Serra Fita', icon: Scissors },
    { id: 'repast', label: 'Repastilhamento', icon: Hammer },
    { id: 'novos', label: 'Novos', icon: PackageOpen },
    { id: 'pagamentos', label: 'Pagamentos', icon: Banknote },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col bg-slate-900 border-r border-slate-800 h-full relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-32 bg-indigo-500/10 blur-3xl pointer-events-none"></div>

      <div className="p-8 flex flex-col items-center text-center z-10 border-b border-slate-800">
        <div className="w-28 h-28 bg-gradient-to-b from-slate-800 to-slate-950 rounded-2xl flex items-center justify-center mb-5 border border-slate-700/50 shadow-2xl shadow-black/40 p-4 relative group overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
           <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
           <img 
            src="https://i.ibb.co/KcrbD45r/Gemini-Generated-Image-icsuqricsuqricsu-1.png" 
            alt="Logo" 
            className="w-full h-full object-contain relative z-10 drop-shadow-lg transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-white">Gestor Geferson</h1>
        <div className="flex items-center gap-2 mt-2 bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-medium text-slate-400">Online</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              currentTab === item.id
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
};

interface MobileNavProps {
  currentTab: Category;
  setTab: (tab: Category) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, setTab }) => {
  const navItems: { id: Category; label: string; icon: React.ElementType }[] = [
    { id: 'resumo', label: 'Geral', icon: PieChart },
    { id: 'serra', label: 'Serra', icon: Scissors },
    { id: 'repast', label: 'Repast', icon: Hammer },
    { id: 'novos', label: 'Novos', icon: PackageOpen },
    { id: 'pagamentos', label: 'Pagtos', icon: Banknote },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 flex justify-around items-center pb-[env(safe-area-inset-bottom)] z-50">
      {navItems.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex flex-col items-center justify-center w-full py-3 transition-all duration-200 ${
              isActive ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <div className={`mb-1 p-1 rounded-lg transition-all ${isActive ? 'bg-indigo-500/10 translate-y-[-2px]' : ''}`}>
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

interface HeaderProps {
  title: string;
  saldo: number;
  currentTab: Category;
  onOpenModal: (type: 'compra' | 'pagamento') => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, saldo, currentTab, onOpenModal, onOpenReport }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="md:hidden w-10 h-10 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center p-1.5 shadow-sm">
          <img src="https://i.ibb.co/KcrbD45r/Gemini-Generated-Image-icsuqricsuqricsu-1.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 hidden md:block">Gestão Financeira Inteligente</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden md:block">Saldo</p>
          <p className={`text-lg md:text-2xl font-bold tracking-tight ${saldo < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {formatCurrency(saldo)}
          </p>
        </div>

        {currentTab === 'resumo' ? (
          <button 
            onClick={onOpenReport}
            className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-xl font-semibold text-sm hover:bg-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <MessageCircle size={18} />
            <span className="hidden md:inline">Relatório</span>
          </button>
        ) : (
          <div className="flex gap-2">
            {currentTab !== 'pagamentos' && (
              <button 
                onClick={() => onOpenModal('compra')}
                className="bg-slate-800 text-rose-400 border border-rose-500/20 w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-700 active:scale-95 transition-all"
              >
                <Minus size={18} /> <span className="hidden md:inline">Compra</span>
              </button>
            )}
            <button 
              onClick={() => onOpenModal('pagamento')}
              className="bg-emerald-500 text-white w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all"
            >
              <Plus size={18} /> <span className="hidden md:inline">Pagamento</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};