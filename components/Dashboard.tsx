
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Client, Transaction, ClientBalance } from '../types';
import ClientForm from './ClientForm';

interface DashboardProps {
  userId: string;
  onClientClick: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userId, onClientClick }) => {
  const [clients, setClients] = useState<ClientBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // جلب الكليان
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);

      if (clientsError) {
        console.error("Supabase Clients Error:", clientsError);
        throw new Error(clientsError.message);
      }

      // جلب العمليات
      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (transError) {
        console.error("Supabase Transactions Error:", transError);
        throw new Error(transError.message);
      }

      const transactions = (transData || []) as Transaction[];
      const rawClients = (clientsData || []) as Client[];
      
      const balances: ClientBalance[] = rawClients.map(client => {
        const clientTrans = transactions.filter(t => t.client_id === client.id);
        const total_credit = clientTrans
          .filter(t => t.type === 'credit')
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const total_payment = clientTrans
          .filter(t => t.type === 'payment')
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        
        return {
          ...client,
          total_credit,
          total_payment,
          balance: total_credit - total_payment
        };
      });

      setClients(balances.sort((a, b) => b.balance - a.balance));
    } catch (err: any) {
      console.error("Dashboard full error info:", err);
      setError(err.message || "وقع مشكل فجلب البيانات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchDashboardData();
  }, [userId]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  const totalGlobalDebt = clients.reduce((sum, c) => sum + Math.max(0, c.balance), 0);

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-8 rounded-3xl text-center shadow-sm">
        <h3 className="text-lg font-bold mb-2">تنبيه</h3>
        <p className="text-xs opacity-90 mb-6 font-mono bg-white/50 p-2 rounded-lg">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 active:scale-95 transition-transform"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-indigo-700 rounded-3xl p-6 text-white shadow-xl">
        <p className="text-indigo-100 text-sm mb-1">المجموع ديال الكريدي اللي برا:</p>
        <h2 className="text-4xl font-bold">{totalGlobalDebt.toLocaleString()} <span className="text-lg">درهم</span></h2>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input 
            type="text"
            placeholder="قلب على كليان..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 pr-11 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl shadow-sm transition-colors flex items-center justify-center min-w-[56px]"
          title="إضافة كليان"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-800 px-1">الكليان</h3>
        {loading ? (
          <div className="text-center py-10 text-slate-400">جاري التحميل...</div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-500">ما كاين حتى كليان.</p>
            <button onClick={() => setShowAddModal(true)} className="mt-3 text-indigo-600 font-bold">زيد كليان</button>
          </div>
        ) : (
          filteredClients.map(client => (
            <div 
              key={client.id}
              onClick={() => onClientClick(client.id)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-indigo-200 cursor-pointer active:scale-[0.98] transition-all flex justify-between items-center"
            >
              <div>
                <h4 className="font-bold text-lg text-slate-800">{client.name}</h4>
                <p className="text-slate-500 text-sm">{client.phone || 'بدون هاتف'}</p>
              </div>
              <div className="text-left">
                <p className={`text-xl font-bold ${client.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {client.balance.toLocaleString()}
                </p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">الرصيد</p>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <ClientForm 
          userId={userId} 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false);
            fetchDashboardData();
          }} 
        />
      )}
    </div>
  );
};

export default Dashboard;
