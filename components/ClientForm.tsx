
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Client } from '../types';

interface ClientFormProps {
  userId: string;
  client?: Client;
  onClose: () => void;
  onSuccess: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ userId, client, onClose, onSuccess }) => {
  const [name, setName] = useState(client?.name || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      if (client) {
        const { error } = await supabase
          .from('clients')
          .update({ name, phone })
          .eq('id', client.id)
          .eq('user_id', userId); 
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([{ 
            user_id: userId, 
            name: name.trim(), 
            phone: phone.trim() || null 
          }]);
        if (error) throw error;
      }
      onSuccess();
    } catch (err: any) {
      console.error('Save error details:', err);
      // إظهار رسالة الخطأ الحقيقية للمستخدم بالدارجة
      alert(`وقع مشكل فالحفظ: ${err.message || 'حاول مرة أخرى'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6 text-right">
          {client ? 'تبديل معلومات الكليان' : 'إضافة كليان جديد'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-right">
            <label className="block text-sm font-bold text-slate-600 mb-1">السمية الكاملة</label>
            <input 
              autoFocus
              required
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-right"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثلا: حميد المراكشي"
            />
          </div>
          <div className="text-right">
            <label className="block text-sm font-bold text-slate-600 mb-1">رقم الهاتف (اختياري)</label>
            <input 
              type="tel" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-right"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="06..."
            />
          </div>
          
          <div className="flex gap-3 pt-4 flex-row-reverse">
            <button 
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl shadow-sm disabled:opacity-50 transition-all active:scale-95"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-2xl transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
