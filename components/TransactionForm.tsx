
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { TransactionType } from '../types';

interface TransactionFormProps {
  userId: string;
  clientId: string;
  type: TransactionType;
  onClose: () => void;
  onSuccess: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ userId, clientId, type, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('transactions')
        .insert([{ 
          user_id: userId, 
          client_id: clientId, 
          amount: numAmount, 
          type 
        }]);
      
      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      console.error('Transaction error:', err);
      alert(`وقع مشكل فالتسجيل: ${err.message || 'حاول مرة أخرى'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-end gap-3 mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            {type === 'credit' ? 'قيد الكريدي' : 'قيد الخلاص'}
          </h2>
          <div className={`p-3 rounded-2xl ${type === 'credit' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {type === 'credit' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-right">
            <label className="block text-sm font-bold text-slate-600 mb-1">المبلغ (بالدرهم)</label>
            <input 
              autoFocus
              required
              type="number"
              step="any"
              inputMode="decimal"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-2xl font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          
          <div className="flex gap-3 pt-4 flex-row-reverse">
            <button 
              type="submit"
              disabled={saving}
              className={`flex-1 ${type === 'credit' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white font-bold py-4 rounded-2xl shadow-md disabled:opacity-50 transition-all active:scale-95`}
            >
              {saving ? 'جاري التسجيل...' : 'تأكيد العملية'}
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 rounded-2xl transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
