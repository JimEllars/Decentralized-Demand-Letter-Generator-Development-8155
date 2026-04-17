import { Link } from 'react-router-dom';
import { FiShield, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const Header = () => (
  <header className="max-w-7xl mx-auto px-4 py-8 relative z-10">
    {/* Back to Ecosystem Link */}
    <a
      href="https://axim.us.com"
      className="absolute top-6 left-4 md:left-8 flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-zinc-400 hover:text-axim-teal transition-colors bg-black/40 border border-white/5 hover:border-axim-teal/30 px-3 py-1.5 rounded-sm backdrop-blur-sm"
    >
      <SafeIcon icon={FiArrowLeft} className="w-3 h-3" />
      Back to AXiM Ecosystem
    </a>

    {/* Minor Logo */}
    <Link to="/start" className="absolute top-16 left-4 md:left-8 flex items-center gap-2 hover:opacity-80 transition-opacity">
      <SafeIcon icon={FiShield} className="text-axim-gold w-5 h-5" />
      <span className="font-inter font-bold tracking-tight text-white text-lg">
        AXiM <span className="text-axim-teal font-medium">Documents</span>
      </span>
    </Link>

    {/* Subtle Background Glow behind the header */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-2xl h-32 bg-axim-teal/5 blur-[100px] rounded-full pointer-events-none z-[-1]"></div>

    <div className="flex flex-col justify-center items-center gap-6 text-center mt-12 md:mt-4 relative">
      <div className="flex flex-col items-center gap-3">
        <div>
          <span className="font-inter text-axim-gold text-sm font-semibold tracking-[2px] uppercase block mb-2 drop-shadow-sm">
            Professional Template Engine
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-lg">
            Demand Letter Generator
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs bg-black/60 text-axim-teal px-5 py-2.5 rounded-full border border-axim-teal/20 shadow-[0_0_15px_rgba(0,229,255,0.1)] font-inter font-medium backdrop-blur-sm">
          <SafeIcon icon={FiCheckCircle} className="w-4 h-4" />
          <span>Secure Local Processing</span>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
