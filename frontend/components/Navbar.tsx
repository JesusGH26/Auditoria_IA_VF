import React from 'react';
import { ShieldCheck, History } from 'lucide-react';

interface NavbarProps {
  onShowHistory: () => void;
  onShowHome: () => void;
  currentView: 'home' | 'history';
}

const Navbar: React.FC<NavbarProps> = ({ onShowHistory, onShowHome, currentView }) => {
  return (
    <nav className="w-full border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onShowHome}
          >
            <div className="bg-cyan-500/10 p-2 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Auditoria IA
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={currentView === 'history' ? onShowHome : onShowHistory}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'history' 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              {currentView === 'history' ? 'Volver al Inicio' : 'Historial'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;