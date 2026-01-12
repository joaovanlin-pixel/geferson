import React, { useState, useEffect, useRef } from 'react';
import { FormState, TransactionType, Totals } from '../types';
import { X, Plus, Minus, MessageCircle, Copy, Check, Send } from 'lucide-react';

const SERRA_PRICE_TABLE = [
  { label: '3" x 1.0', price: 44.00, costRule: 14.00 },
  { label: '3" x 1.1', price: 50.00, costRule: 14.00 },
  { label: '3.5" x 1.1', price: 52.00, costRule: 14.00 },
  { label: '4" x 1.0', price: 52.00, costRule: 14.00 },
  { label: '4" x 1.1', price: 55.00, costRule: 14.00 },
  { label: '4" x 1.2', price: 60.00, costRule: 14.00 },
  { label: '4.5" x 1.0', price: 59.00, costRule: 14.00 },
  { label: '4.5" x 1.1', price: 63.00, costRule: 14.00 },
  { label: '4.5" x 1.2', price: 68.00, costRule: 14.00 },
  { label: '5" x 1.1', price: 73.00, costRule: 14.00 },
  { label: '5" x 1.2', price: 77.00, costRule: 20.00 },
  { label: '5.5" x 1.2', price: 82.00, costRule: 20.00 },
  { label: '5.5" x 1.3', price: 85.00, costRule: 20.00 },
  { label: '6" x 1.2', price: 85.00, costRule: 20.00 },
  { label: '6" x 1.25', price: 88.00, costRule: 20.00 },
  { label: '6" x 1.3', price: 90.00, costRule: 20.00 },
];

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: FormState) => void;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  currentCategory: string;
}

export const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose, onSubmit, form, setForm, currentCategory }) => {
  const firstInputRef = useRef<HTMLInputElement>(null);
  
  // Auto-focus logic
  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure the element is rendered and transition has started
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Logic to auto-calculate price for 'repast'
  useEffect(() => {
    if (isOpen && currentCategory === 'repast' && form.type === 'compra') {
      const z = Number(form.z);
      const corte = Number(form.corte);
      let pricePerTooth = 0;

      if (z > 48) {
        // Destopadeira logic (Z > 48)
        if (corte === 3) pricePerTooth = 4.00;
        else if (corte === 3.5) pricePerTooth = 5.00;
        else if (corte === 4) pricePerTooth = 6.00;
        else if (corte === 5) pricePerTooth = 10.00;
      } else {
        // Standard logic (Z <= 48)
        if (corte === 3) pricePerTooth = 4.80;
        else if (corte === 3.5) pricePerTooth = 5.40;
        else if (corte === 4) pricePerTooth = 5.80;
        else if (corte === 5) pricePerTooth = 12.00;
      }

      let finalUnitPrice = 0;
      if (pricePerTooth > 0 && z > 0) {
        finalUnitPrice = pricePerTooth * z;
      }

      if (finalUnitPrice > 0 && finalUnitPrice !== Number(form.unitPrice)) {
        setForm(prev => ({ ...prev, unitPrice: finalUnitPrice }));
      }
    }
  }, [form.z, form.corte, currentCategory, form.type, isOpen]);

  // Logic to auto-calculate price for 'serra'
  useEffect(() => {
    if (isOpen && currentCategory === 'serra' && form.type === 'compra') {
      const item = SERRA_PRICE_TABLE.find(i => i.label === form.serraItem);
      const length = Number(form.length);
      
      if (item && length > 0) {
        const costPerMeter = item.price - item.costRule;
        const finalUnitPrice = costPerMeter * length;
        
        setForm(prev => ({
          ...prev,
          unitPrice: finalUnitPrice,
          desc: `${item.label} - ${length}m`
        }));
      }
    }
  }, [form.serraItem, form.length, currentCategory, form.type, isOpen]);

  // Logic to auto-calculate Suggested Price for 'Novos' (100% markup / x2)
  useEffect(() => {
    if (isOpen && currentCategory === 'novos' && form.type === 'compra') {
        const cost = Number(form.unitPrice);
        if (cost > 0) {
            setForm(prev => ({ ...prev, suggestedPrice: cost * 2 }));
        }
    }
  }, [form.unitPrice, currentCategory, form.type, isOpen]);

  if (!isOpen) return null;

  const totalCalculado = form.type === 'pagamento' 
    ? Number(form.totalOverride) 
    : Number(form.qty) * Number(form.unitPrice);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full md:max-w-md p-6 rounded-t-3xl md:rounded-2xl border border-slate-800 shadow-2xl relative animate-in slide-in-from-bottom duration-300 md:zoom-in-95">
        <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-6 md:hidden"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
            <X size={24} />
        </button>

        <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${form.type === 'compra' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            {form.type === 'compra' ? <Minus size={16} /> : <Plus size={16} />}
          </div>
          {form.type === 'compra' ? 'Nova Compra' : 'Registrar Pagamento'}
        </h3>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Data</label>
              <input 
                ref={firstInputRef}
                type="date" 
                required
                value={form.date}
                onChange={(e) => setForm({...form, date: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                {currentCategory === 'serra' && form.type === 'compra' ? 'Item' : 'Descrição'}
              </label>
              
              {currentCategory === 'serra' && form.type === 'compra' ? (
                 <select 
                    value={form.serraItem}
                    onChange={(e) => setForm({...form, serraItem: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                 >
                    <option value="">Selecione o Item...</option>
                    {SERRA_PRICE_TABLE.map((item) => (
                      <option key={item.label} value={item.label}>{item.label}</option>
                    ))}
                 </select>
              ) : (
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Lâminas..."
                  value={form.desc}
                  onChange={(e) => setForm({...form, desc: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                />
              )}
            </div>
          </div>

          {form.type === 'compra' && (
            <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
               {currentCategory === 'repast' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Z (Dentes)</label>
                      <input 
                        type="number" 
                        value={form.z} 
                        onChange={e => setForm({...form, z: e.target.value})} 
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white focus:border-amber-500 outline-none transition-colors" 
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Corte</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={form.corte} 
                        onChange={e => setForm({...form, corte: e.target.value})} 
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white focus:border-amber-500 outline-none transition-colors"
                        placeholder="0.0" 
                      />
                    </div>
                  </div>
               )}

               {currentCategory === 'serra' && (
                 <div className="grid grid-cols-1">
                   <label className="text-xs font-bold text-slate-500 mb-1 block">Comprimento da Serra (m)</label>
                   <input 
                     type="number" 
                     step="0.01" 
                     value={form.length} 
                     onChange={e => setForm({...form, length: e.target.value})} 
                     className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white focus:border-blue-500 outline-none transition-colors" 
                     placeholder="Ex: 4.20"
                   />
                 </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Quantidade</label>
                    <input type="number" step="0.01" required value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white font-bold focus:border-indigo-500 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Valor Unit.</label>
                    <input type="number" step="0.01" required value={form.unitPrice} onChange={e => setForm({...form, unitPrice: e.target.value})} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white font-bold focus:border-indigo-500 outline-none transition-colors" />
                  </div>
               </div>

                {currentCategory === 'novos' && (
                 <div className="grid grid-cols-1">
                   <label className="text-xs font-bold text-indigo-400 mb-1 block">Preço Sugerido (Venda)</label>
                   <input 
                     type="number" 
                     step="0.01" 
                     value={form.suggestedPrice} 
                     onChange={e => setForm({...form, suggestedPrice: e.target.value})} 
                     className="w-full bg-indigo-500/10 border border-indigo-500/30 p-2 rounded-lg text-indigo-400 font-bold focus:border-indigo-500 outline-none transition-colors" 
                   />
                 </div>
               )}
            </div>
          )}

          {form.type === 'pagamento' && (
            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-center">
              <label className="text-xs font-bold text-emerald-400 uppercase mb-2 block">Valor do Pagamento</label>
              <input 
                type="number" 
                step="0.01"
                required
                value={form.totalOverride}
                onChange={e => setForm({...form, totalOverride: e.target.value})}
                className="w-full bg-slate-900 border border-emerald-500/30 text-emerald-400 font-bold p-4 rounded-xl outline-none text-2xl text-center focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="flex justify-between items-center py-2 px-2">
             <span className="text-sm font-bold text-slate-500 uppercase">Total Previsto</span>
             <span className="text-xl font-bold text-white">{formatCurrency(totalCalculado)}</span>
          </div>

          <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-lg">
            Confirmar
          </button>
        </form>
      </div>
    </div>
  );
};

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  totals: Totals;
  subtotals: { serra: number; repast: number; novos: number };
  dateRange: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, totals, subtotals, dateRange }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const today = new Date().toLocaleDateString('pt-BR');

  const textReport = `📊 *Resumo Financeiro - Geferson*\n📅 ${today}${dateRange ? `\n🗓 ${dateRange}` : ''}\n\n*Geral*\n🔴 Compras: ${formatCurrency(totals.compras)}\n🟢 Pagos: ${formatCurrency(totals.pagamentos)}\n💰 *Saldo: ${formatCurrency(totals.saldo)}*\n\n*Detalhes (Saldos)*\n✂️ Serra: ${formatCurrency(subtotals.serra)}\n🔨 Repast: ${formatCurrency(subtotals.repast)}\n📦 Novos: ${formatCurrency(subtotals.novos)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(textReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsapp = () => {
    const encoded = encodeURIComponent(textReport);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-400">
          <MessageCircle size={24} /> Relatório para Zap
        </h3>
        
        <div className="w-full h-48 p-4 border border-slate-800 rounded-xl bg-slate-950 text-slate-300 text-xs font-mono mb-4 overflow-y-auto whitespace-pre-wrap">
          {textReport}
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={handleWhatsapp} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20">
            <Send size={18} /> Enviar no WhatsApp
          </button>
          <button onClick={handleCopy} className="w-full py-3 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 font-bold rounded-xl transition-colors flex justify-center items-center gap-2">
            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />} 
            {copied ? 'Copiado!' : 'Copiar Texto'}
          </button>
        </div>
      </div>
    </div>
  );
};