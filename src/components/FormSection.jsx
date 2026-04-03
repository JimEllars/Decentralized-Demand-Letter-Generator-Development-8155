import React from 'react';
import SafeIcon from '../common/SafeIcon';

const FormSection = ({ title, icon: Icon, description, children }) => (
  <div className="space-y-4 pt-8 border-t border-subtle first:border-t-0 first:pt-0">
    <div>
      <h3 className="font-inter font-semibold text-axim-gold text-sm tracking-wide flex items-center gap-2 uppercase">
        <SafeIcon icon={Icon} className="w-4 h-4" />
        {title}
      </h3>
      {description && (
        <p className="font-inter text-xs text-zinc-400 mt-1 pl-6 tracking-wide">
          {description}
        </p>
      )}
    </div>
    <div className="grid grid-cols-1 gap-5">
      {children}
    </div>
  </div>
);

export default FormSection;