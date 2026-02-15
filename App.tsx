
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Dashboard from './components/Dashboard';
import ClientDetails from './components/ClientDetails';
import Header from './components/Header';
import AuthForm from './components/AuthForm';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);

  useEffect(() => {
    // التحقق من الجلسة الحالية
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // مراقبة تغييرات حالة الدخول
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن هناك مستخدم مسجل، أظهر شاشة الدخول
  if (!session) {
    return <AuthForm />;
  }

  const userId = session.user.id;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <Header onLogoClick={() => setActiveClientId(null)} />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeClientId ? (
          <ClientDetails 
            userId={userId} 
            clientId={activeClientId} 
            onBack={() => setActiveClientId(null)} 
          />
        ) : (
          <Dashboard 
            userId={userId} 
            onClientClick={(id) => setActiveClientId(id)} 
          />
        )}
      </main>

      {!activeClientId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-3 md:hidden">
          <div className="text-center text-[10px] text-slate-400 font-bold">
            تطبيق كريدي الحانوت &copy; 2025
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
