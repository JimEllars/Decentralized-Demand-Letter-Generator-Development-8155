import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const icons = {
  success: <FiCheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <FiAlertCircle className="w-5 h-5 text-red-500" />,
  info: <FiInfo className="w-5 h-5 text-blue-500" />,
};

const Toast = ({ id, message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      layout
      className="bg-white border border-slate-200 shadow-xl rounded-xl p-4 flex items-start gap-3 w-80 pointer-events-auto"
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">{message}</p>
      </div>
      <button onClick={() => onClose(id)} className="text-slate-400 hover:text-slate-600 transition-colors">
        <FiX className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default Toast;
