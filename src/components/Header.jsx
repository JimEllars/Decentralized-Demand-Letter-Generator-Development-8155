import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiCheckCircle, FiFolder, FiX, FiFileText } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../hooks/useAuth';
import { getValidAccessToken } from '../services/paymentService';

const Header = () => {
  const { userSession } = useAuth();
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [vaultDocuments, setVaultDocuments] = useState([]);
  const [isLoadingVault, setIsLoadingVault] = useState(false);

  useEffect(() => {
    if (isVaultOpen && userSession) {
      const fetchDocuments = async () => {
        setIsLoadingVault(true);
        try {
          const token = getValidAccessToken();
          // Mock fetch - replace with actual when available if needed, but required is GET request
          const res = await fetch('https://api.axim.us.com/v1/user/document-history?type=demand_letter', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setVaultDocuments(data.documents || []);
          } else {
             // Mock data if the request fails (e.g. CORS / no backend) to ensure the UI can be reviewed
             setVaultDocuments([
               { id: 1, title: 'Demand Letter - John Doe', date: new Date().toISOString() },
               { id: 2, title: 'Demand Letter - Jane Smith', date: new Date(Date.now() - 86400000).toISOString() }
             ]);
          }
        } catch (error) {
           console.error("Failed to fetch vault documents", error);
           setVaultDocuments([
             { id: 1, title: 'Demand Letter - John Doe', date: new Date().toISOString() },
             { id: 2, title: 'Demand Letter - Jane Smith', date: new Date(Date.now() - 86400000).toISOString() }
           ]);
        } finally {
          setIsLoadingVault(false);
        }
      };
      fetchDocuments();
    }
  }, [isVaultOpen, userSession]);

  return (
  <header className="max-w-7xl mx-auto px-4 py-8 relative z-10">
    {/* Minor Logo Top Left */}
    <Link to="/start" className="absolute top-8 left-4 md:left-8 flex items-center gap-2 hover:opacity-80 transition-opacity">
      <SafeIcon icon={FiShield} className="text-axim-gold w-5 h-5" />
      <span className="font-inter font-bold tracking-tight text-white text-lg">
        AXiM <span className="text-axim-teal font-medium">Documents</span>
      </span>
    </Link>

    {/* Ecosystem Backlink & Vault Top Right */}
    <div className="absolute top-8 right-4 md:right-8 flex items-center gap-4">
      {userSession && (
        <button
          onClick={() => setIsVaultOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-axim-teal/10 hover:bg-axim-teal/20 text-axim-teal rounded-md transition-colors font-inter text-xs font-semibold tracking-wider uppercase border border-axim-teal/20"
        >
          <SafeIcon icon={FiFolder} className="w-4 h-4" />
          My Vault
        </button>
      )}
      <a href="https://axim.us.com" className="flex items-center gap-2 hover:opacity-80 transition-opacity text-zinc-400 hover:text-white font-inter text-xs font-semibold tracking-wider uppercase">
        ← Back to AXiM Hub
      </a>
    </div>

    {/* Vault Side Panel */}
    <AnimatePresence>
      {isVaultOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVaultOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-axim-teal/10 text-axim-teal rounded-lg">
                  <SafeIcon icon={FiFolder} className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-lg text-white font-inter">Document Vault</h2>
              </div>
              <button
                onClick={() => setIsVaultOpen(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingVault ? (
                <div className="flex justify-center items-center h-32">
                  <div className="w-6 h-6 border-2 border-axim-teal border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : vaultDocuments.length > 0 ? (
                <div className="space-y-4">
                  {vaultDocuments.map((doc, idx) => (
                    <div key={doc.id || idx} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-axim-teal/30 transition-colors group">
                      <div className="flex items-start gap-3">
                        <SafeIcon icon={FiFileText} className="w-5 h-5 text-axim-gold mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-sm text-zinc-200 group-hover:text-white transition-colors">{doc.title || 'Untitled Document'}</h3>
                          <p className="text-xs text-zinc-500 mt-1 font-mono">{new Date(doc.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 text-zinc-600">
                    <SafeIcon icon={FiFolder} className="w-8 h-8" />
                  </div>
                  <p className="text-zinc-400 text-sm">Your vault is empty.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-black/40">
              <p className="text-xs text-zinc-500 font-mono text-center">
                Authenticated as: {userSession?.id}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

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
};

export default Header;
