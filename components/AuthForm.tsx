
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsVerification(false);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        // إذا كان التسجيل ناجحا وSupabase يطلب التأكيد
        if (data?.user && data?.session === null) {
          setNeedsVerification(true);
        } else {
          alert('تم إنشاء الحساب بنجاح!');
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            throw new Error('خاصك تأكد الإيميل ديالك هو الأول! سير حل الـ Email وضغط على الرابط اللي صيفطنا ليك.');
          }
          throw error;
        }
      }
    } catch (err: any) {
      let friendlyError = err.message;
      if (err.message === 'Invalid login credentials') {
        friendlyError = 'الإيميل أو الكود غلط.';
      } else if (err.message.includes('User already registered')) {
        friendlyError = 'هاد الإيميل ديجا مسجل.';
      }
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl text-center">
          <div className="bg-emerald-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">سير أكد الإيميل ديالك!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            صيفطنا ليك بريد إلكتروني لـ <span className="font-bold text-indigo-600">{email}</span>. 
            حل الـ Email وضغط على الرابط اللي فيه باش تقدر تدخل للحساب ديالك.
          </p>
          <button 
            onClick={() => {
              setNeedsVerification(false);
              setIsSignUp(false);
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            رجوع لصفحة الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">كريدي الحانوت</h1>
          <p className="text-slate-500 mt-2 font-medium">قيد الكريدي للي برا بكل سهولة</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-center font-bold border border-red-100 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">الإيميل</label>
            <input 
              required
              type="email"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">كلمة السر (الكود)</label>
            <input 
              required
              type="password"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'جاري التحميل...' : (isSignUp ? 'إنشاء حساب جديد' : 'دخول للحساب')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-indigo-600 font-bold hover:underline"
          >
            {isSignUp ? 'عندك حساب؟ دخل من هنا' : 'ما عندكش حساب؟ سجل دابا'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
