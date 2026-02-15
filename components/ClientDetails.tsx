
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Client, Transaction, TransactionType } from '../types';
import TransactionForm from './TransactionForm';
import ClientForm from './ClientForm';

interface ClientDetailsProps {
  userId: string;
  clientId: string;
  onBack: () => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ userId, clientId, onBack }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransModal, setShowTransModal] = useState<TransactionType | null>(null);
  const [showEditClientModal, setShowEditClientModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Fetch transactions
      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (transError) throw transError;
      setTransactions(transData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const deleteClient = async () => {
    if (confirm('واش متيقن بغيتي تمسح هاد الكليان؟ كاع المعلومات والكريدي ديالو غايتمسحوا.')) {
      try {
        const { error } = await supabase.from('clients').delete().eq('id', clientId);
        if (error) throw error;
        onBack();
      } catch (err) {
        alert('وقع مشكل فالمسح');
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    if (confirm('تمسح هاد القيدة؟')) {
      try {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        fetchData();
      } catch (err) {
        alert('وقع مشكل فالمسح');
      }
    }
  };

  if (loading && !client) return <div className="text-center py-20">جاري التحميل...</div>;
  if (!client) return <div>الكليان ما كاينش</div>;

  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0);
  const totalPayment = transactions.filter(t => t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalCredit - totalPayment;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={onBack}
          className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="flex gap-2">
          <button onClick={() => setShowEditClientModal(true)} className="text-slate-400 hover:text-slate-600 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={deleteClient} className="text-red-400 hover:text-red-600 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-800">{client.name}</h2>
        <p className="text-slate-500 mb-6">{client.phone || 'بدون هاتف'}</p>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-red-50 rounded-2xl">
            <p className="text-[10px] text-red-400 font-bold uppercase mb-1">الكريدي</p>
            <p className="text-lg font-bold text-red-600">{totalCredit}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl">
            <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">الخلاص</p>
            <p className="text-lg font-bold text-emerald-600">{totalPayment}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <p className="text-[10px] text-indigo-400 font-bold uppercase mb-1">الرصيد</p>
            <p className="text-lg font-bold text-indigo-600">{balance}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setShowTransModal('credit')}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          قيد الكريدي
        </button>
        <button 
          onClick={() => setShowTransModal('payment')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          قيد الخلاص
        </button>
      </div>

      {/* History */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-800 px-1">سجل العمليات</h3>
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <p className="text-center py-6 text-slate-400">ما كاين حتى عملية مسجلة.</p>
          ) : (
            transactions.map(t => (
              <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${t.type === 'credit' ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'}`}>
                    {t.type === 'credit' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">{t.amount} درهم</p>
                    <p className="text-[10px] text-slate-400">{new Date(t.created_at).toLocaleDateString('ar-MA')} - {new Date(t.created_at).toLocaleTimeString('ar-MA', {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteTransaction(t.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {showTransModal && (
        <TransactionForm 
          userId={userId}
          clientId={clientId}
          type={showTransModal}
          onClose={() => setShowTransModal(null)}
          onSuccess={() => {
            setShowTransModal(null);
            fetchData();
          }}
        />
      )}

      {showEditClientModal && (
        <ClientForm 
          userId={userId}
          client={client}
          onClose={() => setShowEditClientModal(false)}
          onSuccess={() => {
            setShowEditClientModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default ClientDetails;
