import React from 'react';
import SafeIcon from '../common/SafeIcon';

const FormSection = ({ title, icon: Icon, children }) => (
  <div className="space-y-4 pt-6 border-t border-slate-200 first:border-t-0 first:pt-0">
    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
      <SafeIcon icon={Icon} className="w-4 h-4" />
      {title}
    </h3>
    <div className="grid grid-cols-1 gap-4">
      {children}
    </div>
  </div>
);

export default FormSection;