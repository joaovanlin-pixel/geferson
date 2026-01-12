import React, { useState, useEffect, useMemo } from 'react';
import { db, collection, addDoc, deleteDoc, doc, query, onSnapshot, COLLECTION_NAME } from './services/firebase';
import { Sidebar, MobileNav, Header } from './components/Layout';
import { Summary } from './components/Summary';
import { TransactionList } from './components/TransactionList';
import { AddModal, ReportModal } from './components/Modals';
import { Transaction, Category, FormState, Totals } from './types';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';

const initialForm: FormState = {
  type: 'compra',
  date: new Date().toISOString().split('T')[0],
  desc: '',
  qty: 1,
  unitPrice: 0,
  totalOverride: 0,
  z: 0,
  corte: 0,
  serraItem: '',
  length: 0,
  suggestedPrice: 0
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentTab, setCurrentTab] = useState<Category>('resumo');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);

  // Filters
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  // Auth Check
  useEffect(() => {
    if (localStorage.getItem('gestor_session') === 'valid') {
      setIsAuthenticated(true);
      initData();
    }
  }, []);

  // Keyboard Shortcut: Press Enter to open Add Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isAddModalOpen && !isReportModalOpen && isAuthenticated) {
        // Don't trigger if user is typing in an input
        const tagName = document.activeElement?.tagName;
        if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
          return;
        }

        if (['serra', 'repast', 'novos'].includes(currentTab)) {
          e.preventDefault();
          setForm({ ...initialForm, type: 'compra' });
          setIsAddModalOpen(true);
        } else if (currentTab === 'pagamentos') {
          e.preventDefault();
          setForm({ ...initialForm, type: 'pagamento' });
          setIsAddModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTab, isAddModalOpen, isReportModalOpen, isAuthenticated]);

  const initData = () => {
    setLoading(true);
    const q = query(collection(db, COLLECTION_NAME));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(data);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error);
      setLoading(false);
    });
    return unsubscribe;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '35018') {
      setIsAuthenticated(true);
      setAuthError(false);
      localStorage.setItem('gestor_session', 'valid');
      initData();
    } else {
      setAuthError(true);
      setPasswordInput('');
      setTimeout(() => setAuthError(false), 1000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('gestor_session');
    setTransactions([]);
  };

  const filteredTransactions = useMemo(() => {
    let data = transactions;
    if (filterStart || filterEnd) {
       const start = filterStart ? new Date(filterStart) : new Date('1900-01-01');
       const end = filterEnd ? new Date(filterEnd) : new Date('2100-12-31');
       // normalize time
       start.setHours(0,0,0,0);
       end.setHours(23,59,59,999);
       
       data = data.filter(t => {
         const d = new Date(t.date);
         const adj = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
         return adj >= start && adj <= end;
       });
    }
    return data;
  }, [transactions, filterStart, filterEnd]);

  const getTotals = (source: Transaction[], category?: string): Totals => {
    const list = category ? source.filter(t => t.category === category) : source;
    
    // Special case for "Pagamentos" tab logic in Vue code vs general logic
    if (category === 'pagamentos') {
        const pagamentos = list.reduce((acc, t) => acc + t.total, 0);
        return { compras: 0, pagamentos, saldo: pagamentos };
    }

    const compras = list.filter(t => t.type === 'compra').reduce((acc, t) => acc + t.total, 0);
    
    // In category views, payments usually don't exist per category unless strictly defined, 
    // but standard logic from legacy code suggests category views subtract cost from 0 (balance negative)
    const pagamentos = list.filter(t => t.type === 'pagamento').reduce((acc, t) => acc + t.total, 0);
    
    // Global Summary Logic
    if (!category) {
        // Global payments are usually tagged with type 'pagamento' or category 'pagamentos'
        const globalPagamentos = source.filter(t => t.type === 'pagamento' || t.category === 'pagamentos').reduce((acc, t) => acc + t.total, 0);
        return { compras, pagamentos: globalPagamentos, saldo: globalPagamentos - compras };
    }

    return { compras, pagamentos, saldo: pagamentos - compras };
  };

  const totals = useMemo(() => getTotals(filteredTransactions), [filteredTransactions]);
  const currentTabTotals = useMemo(() => getTotals(transactions, currentTab !== 'resumo' ? currentTab : undefined), [transactions, currentTab]);

  const handleAddTransaction = async (formData: FormState) => {
    try {
       const total = formData.type === 'pagamento' 
         ? Number(formData.totalOverride) 
         : Number(formData.qty) * Number(formData.unitPrice);

       await addDoc(collection(db, COLLECTION_NAME), {
         ...formData,
         category: currentTab,
         total,
         qty: Number(formData.qty),
         unitPrice: Number(formData.unitPrice),
         length: Number(formData.length),
         suggestedPrice: Number(formData.suggestedPrice),
         timestamp: Date.now()
       });
       setIsAddModalOpen(false);
    } catch (e) {
      alert("Erro ao salvar.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apagar lançamento?")) {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className={`bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-800 shadow-2xl overflow-hidden ${authError ? 'animate-shake' : ''}`}>
           <div className="bg-slate-900 p-8 text-center border-b border-slate-800">
             <div className="w-28 h-28 mx-auto bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl p-4 shadow-2xl mb-6 border border-slate-700/50 flex items-center justify-center relative group">
               <div className="absolute -inset-1 bg-indigo-500/20 blur-md rounded-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
               <img src="https://i.ibb.co/KcrbD45r/Gemini-Generated-Image-icsuqricsuqricsu-1.png" className="w-full h-full object-contain relative z-10 drop-shadow-md"/>
             </div>
             <h2 className="text-2xl font-bold text-white">Gestor Geferson</h2>
             <p className="text-sm text-slate-400">Acesso Restrito</p>
           </div>
           <div className="p-8">
             <form onSubmit={handleLogin}>
               <div className="mb-6">
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Senha</label>
                 <div className="relative">
                   <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Lock size={16}/></span>
                   <input 
                     type="password" 
                     value={passwordInput}
                     onChange={(e) => setPasswordInput(e.target.value)}
                     className={`w-full bg-slate-950 pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-lg font-bold tracking-widest text-center text-white ${authError ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:ring-indigo-500'}`}
                     placeholder="•••••"
                     inputMode="numeric"
                   />
                 </div>
                 {authError && <p className="text-xs text-rose-500 mt-2 text-center font-bold">Senha incorreta</p>}
               </div>
               <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95">
                 ENTRAR
               </button>
             </form>
           </div>
           <div className="bg-slate-950 p-4 text-center border-t border-slate-900">
             <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><ShieldCheck size={12}/> Ambiente Seguro</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen text-slate-200 overflow-hidden bg-slate-950">
      
      {loading && (
        <div className="fixed inset-0 bg-slate-950/80 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
          <Loader2 className="animate-spin text-indigo-500 mb-2" size={40} />
          <p className="font-semibold tracking-wide text-sm uppercase text-slate-400">Carregando...</p>
        </div>
      )}

      <Sidebar currentTab={currentTab} setTab={setCurrentTab} logout={handleLogout} />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header 
          title={currentTab === 'resumo' ? 'Visão Geral' : (currentTab === 'serra' ? 'Serra Fita' : (currentTab === 'repast' ? 'Repastilhamento' : (currentTab === 'novos' ? 'Novos Produtos' : 'Pagamentos')))}
          saldo={currentTab === 'resumo' ? totals.saldo : currentTabTotals.saldo}
          currentTab={currentTab}
          onOpenModal={(type) => {
             setForm({ ...initialForm, type });
             setIsAddModalOpen(true);
          }}
          onOpenReport={() => setIsReportModalOpen(true)}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
          {currentTab === 'resumo' ? (
            <Summary 
              transactions={filteredTransactions} 
              allTransactions={transactions}
              totals={totals} 
              setTab={setCurrentTab}
              filterStart={filterStart}
              setFilterStart={setFilterStart}
              filterEnd={filterEnd}
              setFilterEnd={setFilterEnd}
            />
          ) : (
            <TransactionList 
              transactions={transactions.filter(t => t.category === currentTab)}
              category={currentTab}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      <MobileNav currentTab={currentTab} setTab={setCurrentTab} />

      <AddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSubmit={handleAddTransaction}
        form={form}
        setForm={setForm}
        currentCategory={currentTab}
      />

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        totals={totals}
        subtotals={{
          serra: getTotals(filteredTransactions, 'serra').saldo,
          repast: getTotals(filteredTransactions, 'repast').saldo,
          novos: getTotals(filteredTransactions, 'novos').saldo,
        }}
        dateRange={filterStart || filterEnd ? `Período: ${filterStart || '...'} a ${filterEnd || '...'}` : ''}
      />
    </div>
  );
}