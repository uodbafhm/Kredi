
import React from 'react';
import { supabase } from '../supabaseClient';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  const handleLogout = async () => {
    if(confirm('واش بغيتي تخرج من الحساب؟')) {
      await supabase.auth.signOut();
    }
  };

  return (
    <header className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <div 
          onClick={onLogoClick} 
          className="cursor-pointer flex items-center space-x-reverse space-x-2"
        >
          <div className="bg-white p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">كريدي الحانوت</h1>
        </div>
        
        <button 
          onClick={handleLogout}
          className="text-xs bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
        >
          <span>خروج</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
