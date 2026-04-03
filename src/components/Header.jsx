import React from 'react';
import { FiShield, FiCheckCircle } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const Header = () => (
  <header className="max-w-7xl mx-auto px-4 py-8 relative z-10">
    <div className="flex flex-col justify-center items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="bg-black/50 text-axim-gold p-4 border border-subtle rounded-xl shadow-lg mb-2">
          <SafeIcon icon={FiShield} className="w-8 h-8" />
        </div>
        <div>
          <span className="font-inter text-axim-gold text-sm font-semibold tracking-[2px] uppercase block mb-2">
            Professional Template Engine
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
            AXiM <span className="text-axim-teal">Documents</span>
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs bg-black/40 text-axim-teal px-4 py-2 rounded-full border border-subtle shadow-sm font-inter font-medium">
          <SafeIcon icon={FiCheckCircle} /> 
          <span>Secure Local Processing</span>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
