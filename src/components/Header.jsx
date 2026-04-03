import React from 'react';
import { FiShield, FiCheckCircle } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const Header = () => (
  <header className="max-w-7xl mx-auto px-4 py-8 relative z-10">
    <div className="flex flex-col justify-center items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="bg-glass text-axim-gold p-3 border border-subtle rounded-sm shadow-lg mb-2">
          <SafeIcon icon={FiShield} className="w-8 h-8" />
        </div>
        <div>
          <span className="font-mono text-axim-gold text-[0.7rem] tracking-[3px] uppercase block mb-2">
            Professional Template Engine
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">
            AXiM <span className="text-axim-teal">Documents</span>
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs bg-glass text-axim-teal px-4 py-2 rounded-sm border border-subtle shadow-sm font-mono">
          <SafeIcon icon={FiCheckCircle} /> 
          <span className="font-bold">Secure Local Processing</span>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
