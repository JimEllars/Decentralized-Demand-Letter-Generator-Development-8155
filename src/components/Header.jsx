import React from 'react';
import { FiShield, FiCheckCircle } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const Header = () => (
  <header className="max-w-7xl mx-auto px-4 py-8">
    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-900 text-white p-2.5 rounded-xl shadow-lg">
          <SafeIcon icon={FiShield} className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-blue-950 flex items-center gap-1">
            AXiM <span className="text-blue-600">Documents</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
            Professional Template Engine
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
          <SafeIcon icon={FiCheckCircle} /> 
          <span className="font-bold">Secure Local Processing</span>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
