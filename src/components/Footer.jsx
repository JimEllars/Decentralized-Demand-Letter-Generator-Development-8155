import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-bg-void text-zinc-400 py-6 px-4 border-t border-zinc-800 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
        <div className="mb-4 md:mb-0">
          <p>© 2026 AXiM Systems. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link to="/terms" className="hover:text-white transition-colors duration-200">
            Terms of Service
          </Link>
          <Link to="/privacy" className="hover:text-white transition-colors duration-200">
            Privacy Policy
          </Link>
          <button
            onClick={() => {
              if(window.confirm("This will permanently delete your encrypted draft data from this browser. Continue?")) {
                localStorage.removeItem('axim_demand_draft');
                window.location.reload();
              }
            }}
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1 font-mono"
          >
            <span className="w-2 h-2 rounded-full bg-red-500/50 block"></span> Wipe My Local Data
          </button>
          <a href="mailto:support@axim.us.com" className="hover:text-white transition-colors duration-200">
            support@axim.us.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
