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
          <a href="mailto:support@quickdemandletter.com" className="hover:text-white transition-colors duration-200">
            support@quickdemandletter.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
